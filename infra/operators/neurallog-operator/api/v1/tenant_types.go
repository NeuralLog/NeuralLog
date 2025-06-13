package v1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// TenantSpec defines the desired state of Tenant
type TenantSpec struct {
	// TenantID is the unique identifier for the tenant
	// +kubebuilder:validation:Required
	// +kubebuilder:validation:Pattern=^[a-z0-9-]+$
	TenantID string `json:"tenantId"`

	// PlanID specifies the subscription plan for the tenant
	// +kubebuilder:validation:Required
	// +kubebuilder:validation:Enum=starter;professional;enterprise
	PlanID string `json:"planId"`

	// BillingEmail is the email address for billing notifications
	// +kubebuilder:validation:Required
	// +kubebuilder:validation:Format=email
	BillingEmail string `json:"billingEmail"`

	// Resources defines the resource allocation for the tenant
	// +optional
	Resources *TenantResources `json:"resources,omitempty"`

	// Features defines which features are enabled for the tenant
	// +optional
	Features *TenantFeatures `json:"features,omitempty"`

	// Services defines which services should be deployed for the tenant
	// +optional
	Services *TenantServices `json:"services,omitempty"`
}

// TenantResources defines resource allocation for a tenant
type TenantResources struct {
	// CPU resource allocation
	// +optional
	CPU *ResourceSpec `json:"cpu,omitempty"`

	// Memory resource allocation
	// +optional
	Memory *ResourceSpec `json:"memory,omitempty"`

	// Storage resource allocation
	// +optional
	Storage *StorageSpec `json:"storage,omitempty"`

	// Maximum number of pods
	// +kubebuilder:validation:Minimum=1
	// +kubebuilder:validation:Maximum=100
	// +optional
	Pods *int32 `json:"pods,omitempty"`

	// Maximum number of services
	// +kubebuilder:validation:Minimum=1
	// +kubebuilder:validation:Maximum=20
	// +optional
	Services *int32 `json:"services,omitempty"`
}

// ResourceSpec defines CPU or Memory resource specification
type ResourceSpec struct {
	// Resource requests
	// +optional
	Requests string `json:"requests,omitempty"`

	// Resource limits
	// +optional
	Limits string `json:"limits,omitempty"`
}

// StorageSpec defines storage resource specification
type StorageSpec struct {
	// Storage requests
	// +optional
	Requests string `json:"requests,omitempty"`

	// Storage class
	// +optional
	StorageClass string `json:"storageClass,omitempty"`
}

// TenantFeatures defines which features are enabled for the tenant
type TenantFeatures struct {
	// AI features enabled
	// +optional
	AIEnabled *bool `json:"aiEnabled,omitempty"`

	// Custom metrics enabled
	// +optional
	CustomMetrics *bool `json:"customMetrics,omitempty"`

	// Advanced security features enabled
	// +optional
	AdvancedSecurity *bool `json:"advancedSecurity,omitempty"`

	// Real-time analytics enabled
	// +optional
	RealTimeAnalytics *bool `json:"realTimeAnalytics,omitempty"`

	// API access enabled
	// +optional
	APIAccess *bool `json:"apiAccess,omitempty"`
}

// TenantServices defines which services should be deployed
type TenantServices struct {
	// Log server configuration
	// +optional
	LogServer *ServiceConfig `json:"logServer,omitempty"`

	// Auth service configuration
	// +optional
	AuthService *ServiceConfig `json:"authService,omitempty"`

	// Analytics service configuration
	// +optional
	AnalyticsService *ServiceConfig `json:"analyticsService,omitempty"`

	// AI service configuration
	// +optional
	AIService *ServiceConfig `json:"aiService,omitempty"`
}

// ServiceConfig defines configuration for a service
type ServiceConfig struct {
	// Whether the service is enabled
	// +optional
	Enabled *bool `json:"enabled,omitempty"`

	// Number of replicas
	// +kubebuilder:validation:Minimum=1
	// +kubebuilder:validation:Maximum=10
	// +optional
	Replicas *int32 `json:"replicas,omitempty"`

	// Resource requirements
	// +optional
	Resources *ResourceSpec `json:"resources,omitempty"`

	// Environment variables
	// +optional
	Environment map[string]string `json:"environment,omitempty"`
}

// TenantStatus defines the observed state of Tenant
type TenantStatus struct {
	// Phase represents the current phase of the tenant
	// +kubebuilder:validation:Enum=Pending;Creating;Active;Updating;Deleting;Failed
	Phase string `json:"phase,omitempty"`

	// Message provides additional information about the current phase
	// +optional
	Message string `json:"message,omitempty"`

	// LastUpdated is the timestamp of the last status update
	// +optional
	LastUpdated *metav1.Time `json:"lastUpdated,omitempty"`

	// Conditions represent the latest available observations of the tenant's state
	// +optional
	Conditions []TenantCondition `json:"conditions,omitempty"`

	// NamespaceCreated indicates if the tenant namespace has been created
	// +optional
	NamespaceCreated bool `json:"namespaceCreated,omitempty"`

	// ResourcesProvisioned indicates if resources have been provisioned
	// +optional
	ResourcesProvisioned bool `json:"resourcesProvisioned,omitempty"`

	// ServicesDeployed indicates if services have been deployed
	// +optional
	ServicesDeployed bool `json:"servicesDeployed,omitempty"`

	// ObservedGeneration is the most recent generation observed by the controller
	// +optional
	ObservedGeneration int64 `json:"observedGeneration,omitempty"`
}

// TenantCondition describes the state of a tenant at a certain point
type TenantCondition struct {
	// Type of tenant condition
	Type string `json:"type"`

	// Status of the condition
	Status metav1.ConditionStatus `json:"status"`

	// Last time the condition transitioned
	// +optional
	LastTransitionTime metav1.Time `json:"lastTransitionTime,omitempty"`

	// Reason for the condition's last transition
	// +optional
	Reason string `json:"reason,omitempty"`

	// Message providing details about the transition
	// +optional
	Message string `json:"message,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status
//+kubebuilder:resource:scope=Cluster
//+kubebuilder:printcolumn:name="Tenant ID",type=string,JSONPath=`.spec.tenantId`
//+kubebuilder:printcolumn:name="Plan",type=string,JSONPath=`.spec.planId`
//+kubebuilder:printcolumn:name="Phase",type=string,JSONPath=`.status.phase`
//+kubebuilder:printcolumn:name="Age",type=date,JSONPath=`.metadata.creationTimestamp`

// Tenant is the Schema for the tenants API
type Tenant struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   TenantSpec   `json:"spec,omitempty"`
	Status TenantStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// TenantList contains a list of Tenant
type TenantList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Tenant `json:"items"`
}

func init() {
	SchemeBuilder.Register(&Tenant{}, &TenantList{})
}
