import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from './store/appStore'
import Header from './components/Header'
import Step1FileSelect from './components/steps/Step1FileSelect'
import Step2OutputFolder from './components/steps/Step2OutputFolder'
import Step3FormatSelect from './components/steps/Step3FormatSelect'
import Step4Convert from './components/steps/Step4Convert'
import Footer from './components/Footer'

export default function App(): React.ReactElement {
  const { i18n } = useTranslation()
  const { status } = useAppStore()
  const [activeStep, setActiveStep] = useState(1)

  // Only auto-advance if conversion starts
  useEffect(() => {
    if (status === 'running' || status === 'done' || status === 'error') {
      setActiveStep(4)
    }

    // Ensure step 4 comes into focus when done or on error
    if (status === 'done' || status === 'error') {
      setTimeout(() => {
        const step4 = document.getElementById('step4-container')
        if (step4) {
          step4.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }, [status])

  return (
    <div className="app" lang={i18n.language}>
      <Header onReset={() => setActiveStep(1)} />
      <main className="app-content">
        <Step1FileSelect 
          activeStep={activeStep} 
          onOpen={() => setActiveStep(1)} 
          onNext={() => setActiveStep(2)} 
        />
        <Step2OutputFolder 
          activeStep={activeStep} 
          onOpen={() => setActiveStep(2)} 
          onNext={() => setActiveStep(3)}
          onBack={() => setActiveStep(1)}
        />
        <Step3FormatSelect 
          activeStep={activeStep} 
          onOpen={() => setActiveStep(3)} 
          onNext={() => setActiveStep(4)}
          onBack={() => setActiveStep(2)}
        />
        <Step4Convert 
          activeStep={activeStep} 
          onOpen={() => setActiveStep(4)} 
          onBack={() => setActiveStep(3)}
          onReset={() => setActiveStep(1)}
        />
      </main>
      <Footer />
    </div>
  )
}
