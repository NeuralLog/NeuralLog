package controllers

import (
	"context"
	"fmt"
	"time"

	"github.com/go-logr/logr"
	corev1 "k8s.io/api/core/v1"
	networkingv1 "k8s.io/api/networking/v1"
	rbacv1 "k8s.io/api/rbac/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"

	neurallogv1 "github.com/neurallog/neurallog-operator/api/v1"
)

// TenantReconciler reconciles a Tenant object
type TenantReconciler struct {
	client.Client
	Log    logr.Logger
	Scheme *runtime.Scheme
}

//+kubebuilder:rbac:groups=neurallog.io,resources=tenants,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=neurallog.io,resources=tenants/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=neurallog.io,resources=tenants/finalizers,verbs=update
//+kubebuilder:rbac:groups="",resources=namespaces,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups="",resources=resourcequotas,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups="",resources=limitranges,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups="",resources=serviceaccounts,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=rbac.authorization.k8s.io,resources=roles,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=rbac.authorization.k8s.io,resources=rolebindings,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=networking.k8s.io,resources=networkpolicies,verbs=get;list;watch;create;update;patch;delete

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
func (r *TenantReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	log := r.Log.WithValues("tenant", req.NamespacedName)

	// Fetch the Tenant instance
	tenant := &neurallogv1.Tenant{}
	err := r.Get(ctx, req.NamespacedName, tenant)
	if err != nil {
		if errors.IsNotFound(err) {
			// Request object not found, could have been deleted after reconcile request.
			log.Info("Tenant resource not found. Ignoring since object must be deleted")
			return ctrl.Result{}, nil
		}
		// Error reading the object - requeue the request.
		log.Error(err, "Failed to get Tenant")
		return ctrl.Result{}, err
	}

	// Add finalizer if not present
	finalizerName := "neurallog.io/tenant-finalizer"
	if !controllerutil.ContainsFinalizer(tenant, finalizerName) {
		controllerutil.AddFinalizer(tenant, finalizerName)
		return ctrl.Result{}, r.Update(ctx, tenant)
	}

	// Handle deletion
	if tenant.DeletionTimestamp != nil {
		return r.handleDeletion(ctx, tenant, finalizerName)
	}

	// Update status to indicate reconciliation started
	if tenant.Status.Phase == "" {
		tenant.Status.Phase = "Pending"
		tenant.Status.Message = "Starting tenant provisioning"
		tenant.Status.LastUpdated = &metav1.Time{Time: time.Now()}
		if err := r.Status().Update(ctx, tenant); err != nil {
			log.Error(err, "Failed to update tenant status")
			return ctrl.Result{}, err
		}
	}

	// Reconcile tenant resources
	result, err := r.reconcileTenant(ctx, tenant)
	if err != nil {
		// Update status to failed
		tenant.Status.Phase = "Failed"
		tenant.Status.Message = fmt.Sprintf("Failed to reconcile tenant: %v", err)
		tenant.Status.LastUpdated = &metav1.Time{Time: time.Now()}
		if statusErr := r.Status().Update(ctx, tenant); statusErr != nil {
			log.Error(statusErr, "Failed to update tenant status")
		}
		return result, err
	}

	// Update status to active if all resources are ready
	if r.areResourcesReady(ctx, tenant) {
		tenant.Status.Phase = "Active"
		tenant.Status.Message = "Tenant is active and ready"
		tenant.Status.LastUpdated = &metav1.Time{Time: time.Now()}
		tenant.Status.ObservedGeneration = tenant.Generation
		if err := r.Status().Update(ctx, tenant); err != nil {
			log.Error(err, "Failed to update tenant status")
			return ctrl.Result{}, err
		}
	}

	return result, nil
}

// reconcileTenant handles the main reconciliation logic
func (r *TenantReconciler) reconcileTenant(ctx context.Context, tenant *neurallogv1.Tenant) (ctrl.Result, error) {
	log := r.Log.WithValues("tenant", tenant.Name)

	// Update status to creating
	if tenant.Status.Phase != "Creating" {
		tenant.Status.Phase = "Creating"
		tenant.Status.Message = "Creating tenant resources"
		tenant.Status.LastUpdated = &metav1.Time{Time: time.Now()}
		if err := r.Status().Update(ctx, tenant); err != nil {
			log.Error(err, "Failed to update tenant status")
			return ctrl.Result{}, err
		}
	}

	// Step 1: Create namespace
	if err := r.reconcileNamespace(ctx, tenant); err != nil {
		log.Error(err, "Failed to reconcile namespace")
		return ctrl.Result{RequeueAfter: time.Minute}, err
	}
	tenant.Status.NamespaceCreated = true

	// Step 2: Create resource quota and limit range
	if err := r.reconcileResourceQuota(ctx, tenant); err != nil {
		log.Error(err, "Failed to reconcile resource quota")
		return ctrl.Result{RequeueAfter: time.Minute}, err
	}

	if err := r.reconcileLimitRange(ctx, tenant); err != nil {
		log.Error(err, "Failed to reconcile limit range")
		return ctrl.Result{RequeueAfter: time.Minute}, err
	}
	tenant.Status.ResourcesProvisioned = true

	// Step 3: Create RBAC resources
	if err := r.reconcileRBAC(ctx, tenant); err != nil {
		log.Error(err, "Failed to reconcile RBAC")
		return ctrl.Result{RequeueAfter: time.Minute}, err
	}

	// Step 4: Create network policy
	if err := r.reconcileNetworkPolicy(ctx, tenant); err != nil {
		log.Error(err, "Failed to reconcile network policy")
		return ctrl.Result{RequeueAfter: time.Minute}, err
	}

	// Step 5: Deploy services (if specified)
	if err := r.reconcileServices(ctx, tenant); err != nil {
		log.Error(err, "Failed to reconcile services")
		return ctrl.Result{RequeueAfter: time.Minute}, err
	}
	tenant.Status.ServicesDeployed = true

	log.Info("Successfully reconciled tenant")
	return ctrl.Result{}, nil
}

// reconcileNamespace creates or updates the tenant namespace
func (r *TenantReconciler) reconcileNamespace(ctx context.Context, tenant *neurallogv1.Tenant) error {
	namespaceName := fmt.Sprintf("tenant-%s", tenant.Spec.TenantID)
	
	namespace := &corev1.Namespace{
		ObjectMeta: metav1.ObjectMeta{
			Name: namespaceName,
			Labels: map[string]string{
				"app.kubernetes.io/name":      "neurallog",
				"app.kubernetes.io/component": "tenant-namespace",
				"neurallog.io/tenant-id":      tenant.Spec.TenantID,
				"neurallog.io/plan":           tenant.Spec.PlanID,
				"neurallog.io/created-by":     "neurallog-operator",
			},
			Annotations: map[string]string{
				"neurallog.io/created-at":     time.Now().Format(time.RFC3339),
				"neurallog.io/billing-email":  tenant.Spec.BillingEmail,
			},
		},
	}

	// Set owner reference
	if err := controllerutil.SetControllerReference(tenant, namespace, r.Scheme); err != nil {
		return err
	}

	// Create or update namespace
	found := &corev1.Namespace{}
	err := r.Get(ctx, types.NamespacedName{Name: namespaceName}, found)
	if err != nil && errors.IsNotFound(err) {
		r.Log.Info("Creating namespace", "namespace", namespaceName)
		return r.Create(ctx, namespace)
	} else if err != nil {
		return err
	}

	// Update namespace if needed
	if found.Labels == nil {
		found.Labels = make(map[string]string)
	}
	for k, v := range namespace.Labels {
		found.Labels[k] = v
	}
	if found.Annotations == nil {
		found.Annotations = make(map[string]string)
	}
	for k, v := range namespace.Annotations {
		found.Annotations[k] = v
	}

	return r.Update(ctx, found)
}

// reconcileResourceQuota creates or updates the resource quota for the tenant
func (r *TenantReconciler) reconcileResourceQuota(ctx context.Context, tenant *neurallogv1.Tenant) error {
	namespaceName := fmt.Sprintf("tenant-%s", tenant.Spec.TenantID)
	quotaName := fmt.Sprintf("tenant-%s-quota", tenant.Spec.TenantID)

	// Get resource limits based on plan
	hard := r.getResourceQuotaHard(tenant)

	quota := &corev1.ResourceQuota{
		ObjectMeta: metav1.ObjectMeta{
			Name:      quotaName,
			Namespace: namespaceName,
			Labels: map[string]string{
				"neurallog.io/tenant-id": tenant.Spec.TenantID,
			},
		},
		Spec: corev1.ResourceQuotaSpec{
			Hard: hard,
		},
	}

	// Set owner reference
	if err := controllerutil.SetControllerReference(tenant, quota, r.Scheme); err != nil {
		return err
	}

	// Create or update resource quota
	found := &corev1.ResourceQuota{}
	err := r.Get(ctx, types.NamespacedName{Name: quotaName, Namespace: namespaceName}, found)
	if err != nil && errors.IsNotFound(err) {
		r.Log.Info("Creating resource quota", "quota", quotaName)
		return r.Create(ctx, quota)
	} else if err != nil {
		return err
	}

	// Update quota if needed
	found.Spec.Hard = hard
	return r.Update(ctx, found)
}

// getResourceQuotaHard returns resource quota hard limits based on tenant plan
func (r *TenantReconciler) getResourceQuotaHard(tenant *neurallogv1.Tenant) corev1.ResourceList {
	hard := corev1.ResourceList{}

	// Set defaults based on plan
	switch tenant.Spec.PlanID {
	case "starter":
		hard[corev1.ResourceRequestsCPU] = resource.MustParse("2")
		hard[corev1.ResourceRequestsMemory] = resource.MustParse("4Gi")
		hard[corev1.ResourceLimitsCPU] = resource.MustParse("4")
		hard[corev1.ResourceLimitsMemory] = resource.MustParse("8Gi")
		hard[corev1.ResourceRequestsStorage] = resource.MustParse("10Gi")
		hard[corev1.ResourcePods] = resource.MustParse("10")
		hard[corev1.ResourceServices] = resource.MustParse("5")
	case "professional":
		hard[corev1.ResourceRequestsCPU] = resource.MustParse("8")
		hard[corev1.ResourceRequestsMemory] = resource.MustParse("16Gi")
		hard[corev1.ResourceLimitsCPU] = resource.MustParse("16")
		hard[corev1.ResourceLimitsMemory] = resource.MustParse("32Gi")
		hard[corev1.ResourceRequestsStorage] = resource.MustParse("100Gi")
		hard[corev1.ResourcePods] = resource.MustParse("50")
		hard[corev1.ResourceServices] = resource.MustParse("15")
	case "enterprise":
		hard[corev1.ResourceRequestsCPU] = resource.MustParse("32")
		hard[corev1.ResourceRequestsMemory] = resource.MustParse("64Gi")
		hard[corev1.ResourceLimitsCPU] = resource.MustParse("64")
		hard[corev1.ResourceLimitsMemory] = resource.MustParse("128Gi")
		hard[corev1.ResourceRequestsStorage] = resource.MustParse("1Ti")
		hard[corev1.ResourcePods] = resource.MustParse("100")
		hard[corev1.ResourceServices] = resource.MustParse("20")
	}

	// Override with custom resources if specified
	if tenant.Spec.Resources != nil {
		if tenant.Spec.Resources.CPU != nil {
			if tenant.Spec.Resources.CPU.Requests != "" {
				hard[corev1.ResourceRequestsCPU] = resource.MustParse(tenant.Spec.Resources.CPU.Requests)
			}
			if tenant.Spec.Resources.CPU.Limits != "" {
				hard[corev1.ResourceLimitsCPU] = resource.MustParse(tenant.Spec.Resources.CPU.Limits)
			}
		}
		if tenant.Spec.Resources.Memory != nil {
			if tenant.Spec.Resources.Memory.Requests != "" {
				hard[corev1.ResourceRequestsMemory] = resource.MustParse(tenant.Spec.Resources.Memory.Requests)
			}
			if tenant.Spec.Resources.Memory.Limits != "" {
				hard[corev1.ResourceLimitsMemory] = resource.MustParse(tenant.Spec.Resources.Memory.Limits)
			}
		}
		if tenant.Spec.Resources.Storage != nil && tenant.Spec.Resources.Storage.Requests != "" {
			hard[corev1.ResourceRequestsStorage] = resource.MustParse(tenant.Spec.Resources.Storage.Requests)
		}
		if tenant.Spec.Resources.Pods != nil {
			hard[corev1.ResourcePods] = *resource.NewQuantity(int64(*tenant.Spec.Resources.Pods), resource.DecimalSI)
		}
		if tenant.Spec.Resources.Services != nil {
			hard[corev1.ResourceServices] = *resource.NewQuantity(int64(*tenant.Spec.Resources.Services), resource.DecimalSI)
		}
	}

	return hard
}

// reconcileLimitRange creates or updates the limit range for the tenant
func (r *TenantReconciler) reconcileLimitRange(ctx context.Context, tenant *neurallogv1.Tenant) error {
	namespaceName := fmt.Sprintf("tenant-%s", tenant.Spec.TenantID)
	limitRangeName := fmt.Sprintf("tenant-%s-limits", tenant.Spec.TenantID)

	limits := r.getLimitRangeSpec(tenant)

	limitRange := &corev1.LimitRange{
		ObjectMeta: metav1.ObjectMeta{
			Name:      limitRangeName,
			Namespace: namespaceName,
			Labels: map[string]string{
				"neurallog.io/tenant-id": tenant.Spec.TenantID,
			},
		},
		Spec: corev1.LimitRangeSpec{
			Limits: limits,
		},
	}

	// Set owner reference
	if err := controllerutil.SetControllerReference(tenant, limitRange, r.Scheme); err != nil {
		return err
	}

	// Create or update limit range
	found := &corev1.LimitRange{}
	err := r.Get(ctx, types.NamespacedName{Name: limitRangeName, Namespace: namespaceName}, found)
	if err != nil && errors.IsNotFound(err) {
		r.Log.Info("Creating limit range", "limitRange", limitRangeName)
		return r.Create(ctx, limitRange)
	} else if err != nil {
		return err
	}

	// Update limit range if needed
	found.Spec.Limits = limits
	return r.Update(ctx, found)
}

// getLimitRangeSpec returns limit range specification based on tenant plan
func (r *TenantReconciler) getLimitRangeSpec(tenant *neurallogv1.Tenant) []corev1.LimitRangeItem {
	var limits []corev1.LimitRangeItem

	// Container limits
	containerLimit := corev1.LimitRangeItem{
		Type: corev1.LimitTypeContainer,
	}

	// Pod limits
	podLimit := corev1.LimitRangeItem{
		Type: corev1.LimitTypePod,
	}

	// PVC limits
	pvcLimit := corev1.LimitRangeItem{
		Type: corev1.LimitTypePersistentVolumeClaim,
	}

	// Set defaults based on plan
	switch tenant.Spec.PlanID {
	case "starter":
		containerLimit.Default = corev1.ResourceList{
			corev1.ResourceCPU:    resource.MustParse("100m"),
			corev1.ResourceMemory: resource.MustParse("128Mi"),
		}
		containerLimit.DefaultRequest = corev1.ResourceList{
			corev1.ResourceCPU:    resource.MustParse("50m"),
			corev1.ResourceMemory: resource.MustParse("64Mi"),
		}
		containerLimit.Max = corev1.ResourceList{
			corev1.ResourceCPU:    resource.MustParse("1"),
			corev1.ResourceMemory: resource.MustParse("2Gi"),
		}
		containerLimit.Min = corev1.ResourceList{
			corev1.ResourceCPU:    resource.MustParse("10m"),
			corev1.ResourceMemory: resource.MustParse("32Mi"),
		}
		podLimit.Max = corev1.ResourceList{
			corev1.ResourceCPU:    resource.MustParse("2"),
			corev1.ResourceMemory: resource.MustParse("4Gi"),
		}
		pvcLimit.Max = corev1.ResourceList{
			corev1.ResourceStorage: resource.MustParse("5Gi"),
		}
		pvcLimit.Min = corev1.ResourceList{
			corev1.ResourceStorage: resource.MustParse("1Gi"),
		}
	case "professional":
		containerLimit.Default = corev1.ResourceList{
			corev1.ResourceCPU:    resource.MustParse("200m"),
			corev1.ResourceMemory: resource.MustParse("256Mi"),
		}
		containerLimit.DefaultRequest = corev1.ResourceList{
			corev1.ResourceCPU:    resource.MustParse("100m"),
			corev1.ResourceMemory: resource.MustParse("128Mi"),
		}
		containerLimit.Max = corev1.ResourceList{
			corev1.ResourceCPU:    resource.MustParse("4"),
			corev1.ResourceMemory: resource.MustParse("8Gi"),
		}
		containerLimit.Min = corev1.ResourceList{
			corev1.ResourceCPU:    resource.MustParse("10m"),
			corev1.ResourceMemory: resource.MustParse("32Mi"),
		}
		podLimit.Max = corev1.ResourceList{
			corev1.ResourceCPU:    resource.MustParse("8"),
			corev1.ResourceMemory: resource.MustParse("16Gi"),
		}
		pvcLimit.Max = corev1.ResourceList{
			corev1.ResourceStorage: resource.MustParse("50Gi"),
		}
		pvcLimit.Min = corev1.ResourceList{
			corev1.ResourceStorage: resource.MustParse("1Gi"),
		}
	case "enterprise":
		containerLimit.Default = corev1.ResourceList{
			corev1.ResourceCPU:    resource.MustParse("500m"),
			corev1.ResourceMemory: resource.MustParse("512Mi"),
		}
		containerLimit.DefaultRequest = corev1.ResourceList{
			corev1.ResourceCPU:    resource.MustParse("250m"),
			corev1.ResourceMemory: resource.MustParse("256Mi"),
		}
		containerLimit.Max = corev1.ResourceList{
			corev1.ResourceCPU:    resource.MustParse("16"),
			corev1.ResourceMemory: resource.MustParse("32Gi"),
		}
		containerLimit.Min = corev1.ResourceList{
			corev1.ResourceCPU:    resource.MustParse("10m"),
			corev1.ResourceMemory: resource.MustParse("32Mi"),
		}
		podLimit.Max = corev1.ResourceList{
			corev1.ResourceCPU:    resource.MustParse("32"),
			corev1.ResourceMemory: resource.MustParse("64Gi"),
		}
		pvcLimit.Max = corev1.ResourceList{
			corev1.ResourceStorage: resource.MustParse("500Gi"),
		}
		pvcLimit.Min = corev1.ResourceList{
			corev1.ResourceStorage: resource.MustParse("1Gi"),
		}
	}

	limits = append(limits, containerLimit, podLimit, pvcLimit)
	return limits
}

// reconcileRBAC creates or updates RBAC resources for the tenant
func (r *TenantReconciler) reconcileRBAC(ctx context.Context, tenant *neurallogv1.Tenant) error {
	namespaceName := fmt.Sprintf("tenant-%s", tenant.Spec.TenantID)

	// Create service account
	if err := r.reconcileServiceAccount(ctx, tenant, namespaceName); err != nil {
		return err
	}

	// Create role
	if err := r.reconcileRole(ctx, tenant, namespaceName); err != nil {
		return err
	}

	// Create role binding
	if err := r.reconcileRoleBinding(ctx, tenant, namespaceName); err != nil {
		return err
	}

	return nil
}

// reconcileServiceAccount creates or updates the service account
func (r *TenantReconciler) reconcileServiceAccount(ctx context.Context, tenant *neurallogv1.Tenant, namespaceName string) error {
	saName := fmt.Sprintf("tenant-%s-sa", tenant.Spec.TenantID)

	sa := &corev1.ServiceAccount{
		ObjectMeta: metav1.ObjectMeta{
			Name:      saName,
			Namespace: namespaceName,
			Labels: map[string]string{
				"neurallog.io/tenant-id": tenant.Spec.TenantID,
			},
		},
		AutomountServiceAccountToken: &[]bool{false}[0], // Disable auto-mounting for security
	}

	// Set owner reference
	if err := controllerutil.SetControllerReference(tenant, sa, r.Scheme); err != nil {
		return err
	}

	// Create or update service account
	found := &corev1.ServiceAccount{}
	err := r.Get(ctx, types.NamespacedName{Name: saName, Namespace: namespaceName}, found)
	if err != nil && errors.IsNotFound(err) {
		r.Log.Info("Creating service account", "serviceAccount", saName)
		return r.Create(ctx, sa)
	} else if err != nil {
		return err
	}

	return nil
}

// reconcileRole creates or updates the role
func (r *TenantReconciler) reconcileRole(ctx context.Context, tenant *neurallogv1.Tenant, namespaceName string) error {
	roleName := fmt.Sprintf("tenant-%s-role", tenant.Spec.TenantID)

	role := &rbacv1.Role{
		ObjectMeta: metav1.ObjectMeta{
			Name:      roleName,
			Namespace: namespaceName,
			Labels: map[string]string{
				"neurallog.io/tenant-id": tenant.Spec.TenantID,
			},
		},
		Rules: []rbacv1.PolicyRule{
			{
				APIGroups: []string{""},
				Resources: []string{"pods", "services", "configmaps", "secrets"},
				Verbs:     []string{"get", "list", "watch"},
			},
			{
				APIGroups: []string{"apps"},
				Resources: []string{"deployments", "replicasets"},
				Verbs:     []string{"get", "list", "watch"},
			},
			{
				APIGroups: []string{""},
				Resources: []string{"pods/log"},
				Verbs:     []string{"get", "list"},
			},
		},
	}

	// Set owner reference
	if err := controllerutil.SetControllerReference(tenant, role, r.Scheme); err != nil {
		return err
	}

	// Create or update role
	found := &rbacv1.Role{}
	err := r.Get(ctx, types.NamespacedName{Name: roleName, Namespace: namespaceName}, found)
	if err != nil && errors.IsNotFound(err) {
		r.Log.Info("Creating role", "role", roleName)
		return r.Create(ctx, role)
	} else if err != nil {
		return err
	}

	// Update role if needed
	found.Rules = role.Rules
	return r.Update(ctx, found)
}

// reconcileRoleBinding creates or updates the role binding
func (r *TenantReconciler) reconcileRoleBinding(ctx context.Context, tenant *neurallogv1.Tenant, namespaceName string) error {
	rbName := fmt.Sprintf("tenant-%s-binding", tenant.Spec.TenantID)
	roleName := fmt.Sprintf("tenant-%s-role", tenant.Spec.TenantID)
	saName := fmt.Sprintf("tenant-%s-sa", tenant.Spec.TenantID)

	rb := &rbacv1.RoleBinding{
		ObjectMeta: metav1.ObjectMeta{
			Name:      rbName,
			Namespace: namespaceName,
			Labels: map[string]string{
				"neurallog.io/tenant-id": tenant.Spec.TenantID,
			},
		},
		Subjects: []rbacv1.Subject{
			{
				Kind:      "ServiceAccount",
				Name:      saName,
				Namespace: namespaceName,
			},
		},
		RoleRef: rbacv1.RoleRef{
			Kind:     "Role",
			Name:     roleName,
			APIGroup: "rbac.authorization.k8s.io",
		},
	}

	// Set owner reference
	if err := controllerutil.SetControllerReference(tenant, rb, r.Scheme); err != nil {
		return err
	}

	// Create or update role binding
	found := &rbacv1.RoleBinding{}
	err := r.Get(ctx, types.NamespacedName{Name: rbName, Namespace: namespaceName}, found)
	if err != nil && errors.IsNotFound(err) {
		r.Log.Info("Creating role binding", "roleBinding", rbName)
		return r.Create(ctx, rb)
	} else if err != nil {
		return err
	}

	// Update role binding if needed
	found.Subjects = rb.Subjects
	found.RoleRef = rb.RoleRef
	return r.Update(ctx, found)
}

// reconcileNetworkPolicy creates or updates the network policy for tenant isolation
func (r *TenantReconciler) reconcileNetworkPolicy(ctx context.Context, tenant *neurallogv1.Tenant) error {
	namespaceName := fmt.Sprintf("tenant-%s", tenant.Spec.TenantID)
	npName := fmt.Sprintf("tenant-%s-isolation", tenant.Spec.TenantID)

	np := &networkingv1.NetworkPolicy{
		ObjectMeta: metav1.ObjectMeta{
			Name:      npName,
			Namespace: namespaceName,
			Labels: map[string]string{
				"neurallog.io/tenant-id": tenant.Spec.TenantID,
			},
		},
		Spec: networkingv1.NetworkPolicySpec{
			PodSelector: metav1.LabelSelector{}, // Apply to all pods in namespace
			PolicyTypes: []networkingv1.PolicyType{
				networkingv1.PolicyTypeIngress,
				networkingv1.PolicyTypeEgress,
			},
			Ingress: []networkingv1.NetworkPolicyIngressRule{
				{
					From: []networkingv1.NetworkPolicyPeer{
						{
							NamespaceSelector: &metav1.LabelSelector{
								MatchLabels: map[string]string{
									"name": namespaceName,
								},
							},
						},
						{
							NamespaceSelector: &metav1.LabelSelector{
								MatchLabels: map[string]string{
									"name": "neurallog-system",
								},
							},
						},
						{
							NamespaceSelector: &metav1.LabelSelector{
								MatchLabels: map[string]string{
									"name": "kube-system",
								},
							},
						},
						{
							NamespaceSelector: &metav1.LabelSelector{
								MatchLabels: map[string]string{
									"name": "ingress-nginx",
								},
							},
						},
					},
				},
			},
			Egress: []networkingv1.NetworkPolicyEgressRule{
				{
					To: []networkingv1.NetworkPolicyPeer{
						{
							NamespaceSelector: &metav1.LabelSelector{
								MatchLabels: map[string]string{
									"name": namespaceName,
								},
							},
						},
						{
							NamespaceSelector: &metav1.LabelSelector{
								MatchLabels: map[string]string{
									"name": "neurallog-system",
								},
							},
						},
					},
				},
				{
					// Allow DNS
					To: []networkingv1.NetworkPolicyPeer{},
					Ports: []networkingv1.NetworkPolicyPort{
						{
							Protocol: &[]corev1.Protocol{corev1.ProtocolUDP}[0],
							Port:     &[]int32{53}[0],
						},
					},
				},
				{
					// Allow HTTPS
					To: []networkingv1.NetworkPolicyPeer{},
					Ports: []networkingv1.NetworkPolicyPort{
						{
							Protocol: &[]corev1.Protocol{corev1.ProtocolTCP}[0],
							Port:     &[]int32{443}[0],
						},
					},
				},
			},
		},
	}

	// Set owner reference
	if err := controllerutil.SetControllerReference(tenant, np, r.Scheme); err != nil {
		return err
	}

	// Create or update network policy
	found := &networkingv1.NetworkPolicy{}
	err := r.Get(ctx, types.NamespacedName{Name: npName, Namespace: namespaceName}, found)
	if err != nil && errors.IsNotFound(err) {
		r.Log.Info("Creating network policy", "networkPolicy", npName)
		return r.Create(ctx, np)
	} else if err != nil {
		return err
	}

	// Update network policy if needed
	found.Spec = np.Spec
	return r.Update(ctx, found)
}

// reconcileServices handles service deployment (placeholder for now)
func (r *TenantReconciler) reconcileServices(ctx context.Context, tenant *neurallogv1.Tenant) error {
	// TODO: Implement service deployment based on tenant.Spec.Services
	// This would deploy log server, auth service, analytics service, etc.
	r.Log.Info("Service deployment not yet implemented", "tenant", tenant.Spec.TenantID)
	return nil
}

// areResourcesReady checks if all tenant resources are ready
func (r *TenantReconciler) areResourcesReady(ctx context.Context, tenant *neurallogv1.Tenant) bool {
	// For now, just check if basic resources are created
	return tenant.Status.NamespaceCreated &&
		   tenant.Status.ResourcesProvisioned &&
		   tenant.Status.ServicesDeployed
}

// handleDeletion handles tenant deletion and cleanup
func (r *TenantReconciler) handleDeletion(ctx context.Context, tenant *neurallogv1.Tenant, finalizerName string) (ctrl.Result, error) {
	log := r.Log.WithValues("tenant", tenant.Name)

	log.Info("Handling tenant deletion")

	// Update status to deleting
	if tenant.Status.Phase != "Deleting" {
		tenant.Status.Phase = "Deleting"
		tenant.Status.Message = "Deleting tenant resources"
		tenant.Status.LastUpdated = &metav1.Time{Time: time.Now()}
		if err := r.Status().Update(ctx, tenant); err != nil {
			log.Error(err, "Failed to update tenant status")
			return ctrl.Result{}, err
		}
	}

	// Perform cleanup operations here
	// The namespace and all its resources will be automatically deleted
	// due to owner references, but we could add additional cleanup logic

	log.Info("Tenant cleanup completed")

	// Remove finalizer to allow deletion
	controllerutil.RemoveFinalizer(tenant, finalizerName)
	return ctrl.Result{}, r.Update(ctx, tenant)
}

// SetupWithManager sets up the controller with the Manager.
func (r *TenantReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&neurallogv1.Tenant{}).
		Owns(&corev1.Namespace{}).
		Owns(&corev1.ResourceQuota{}).
		Owns(&corev1.LimitRange{}).
		Owns(&corev1.ServiceAccount{}).
		Owns(&rbacv1.Role{}).
		Owns(&rbacv1.RoleBinding{}).
		Owns(&networkingv1.NetworkPolicy{}).
		Complete(r)
}
