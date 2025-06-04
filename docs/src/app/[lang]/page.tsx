import { AboutSection } from '@/components/landing-page/about-section'
import { ContributingSection } from '@/components/landing-page/contributing/contributing-section'
import { DownloadSection } from '@/components/landing-page/download/download-section'
import { FaqSection } from '@/components/landing-page/faq/faq-section'
import { FeaturesSection } from '@/components/landing-page/features/features-section'
import { HeroSection } from '@/components/landing-page/hero-section'
import { TestimonialsSection } from '@/components/landing-page/testimonials/testimonials-section'
import { TroubleshootingSection } from '@/components/landing-page/troubleshooting/troubleshooting-section'

export async function generateStaticParams() {
	// Ensure these locales match your supported locales (e.g., from middleware.ts)
	return [{ lang: 'en' }, { lang: 'de' }]
}

const Index = async () => {
	return (
		<div className="min-h-screen bg-background">
			{/* <Navigation /> */}
			<main id="main-content">
				<HeroSection />
				<div id="features">
					<FeaturesSection />
				</div>
				<div id="about">
					<AboutSection />
				</div>
				<div id="testimonials">
					<TestimonialsSection />
				</div>
				<div id="faq">
					<FaqSection />
				</div>
				<div id="download">
					<DownloadSection />
				</div>
				<div id="contributing">
					<ContributingSection />
				</div>
				<div id="troubleshooting">
					<TroubleshootingSection />
				</div>
			</main>
		</div>
	)
}

export default Index
