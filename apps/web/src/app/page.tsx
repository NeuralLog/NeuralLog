import {
  Layout,
  Container,
  Hero,
  FeaturesGrid,
  CallToAction,
  Footer
} from '@/components/home';
import Link from 'next/link';

export default function Home() {
  // Define features
  const features = [
    {
      title: 'Zero-Knowledge Encryption',
      description: 'Your data is encrypted before it leaves your environment. We analyze patterns without ever seeing your plaintext data.',
      buttonText: 'Learn More',
      buttonVariant: 'default' as const
    },
    {
      title: 'AI-Powered Insights',
      description: 'Get intelligent anomaly detection and pattern analysis while maintaining complete data privacy.',
      buttonText: 'Explore',
      buttonVariant: 'outline' as const
    },
    {
      title: 'Enterprise Security',
      description: 'Built for the most security-conscious organizations with SOC 2 ready architecture and compliance features.',
      buttonText: 'See Security',
      buttonVariant: 'default' as const
    },
    {
      title: 'Multi-Language SDKs',
      description: 'Integrate seamlessly with your existing systems using our comprehensive SDKs for all major languages.',
      buttonText: 'View SDKs',
      buttonVariant: 'outline' as const
    }
  ];

  // Define CTA buttons
  const ctaButtons = [
    {
      text: 'Sign Up',
      variant: 'default' as const,
      size: 'lg' as const,
      href: '/sign-up'
    },
    {
      text: 'Log In',
      variant: 'outline' as const,
      size: 'lg' as const,
      href: '/login'
    },
    {
      text: 'Documentation',
      variant: 'subtle' as const,
      size: 'lg' as const,
      href: '#'
    }
  ];

  return (
    <Layout>
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">NeuralLog</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-2 rounded-md text-sm font-medium">
                Log In
              </Link>
              <Link href="/sign-up" className="bg-brand-600 text-white hover:bg-brand-700 px-3 py-2 rounded-md text-sm font-medium">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <Container>
        <Hero
          title="NeuralLog - Zero-Knowledge AI Telemetry"
          description="The world's first zero-knowledge logging platform for AI systems. Get powerful insights while keeping your data completely private and secure."
        />

        <FeaturesGrid features={features} />

        <div className="bg-brand-50 dark:bg-gray-700 p-6 rounded-lg mb-8 border border-brand-200 dark:border-gray-600">
          <h2 className="text-2xl font-semibold mb-4 text-center text-brand-600 dark:text-brand-400">Ready to get started?</h2>
          <p className="text-center text-gray-700 dark:text-gray-300 mb-6">
            Be among the first to experience zero-knowledge AI logging.
            Sign up for early access and help shape the future of secure AI telemetry.
          </p>
          <CallToAction buttons={ctaButtons} />
        </div>
      </Container>

      <Footer companyName="NeuralLog" />
    </Layout>
  );
}
