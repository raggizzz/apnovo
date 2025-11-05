import styles from "./StepIndicator.module.css";

interface Step {
  number: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className={styles.container}>
      {steps.map((step, index) => (
        <div key={step.number} className={styles.stepWrapper}>
          <div className={styles.stepCircleWrapper}>
            <div
              className={`${styles.stepCircle} ${
                step.number < currentStep
                  ? styles.completed
                  : step.number === currentStep
                  ? styles.active
                  : styles.pending
              }`}
            >
              {step.number < currentStep ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M13 4L6 11L3 8"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <span>{step.number}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={styles.connector} />
            )}
          </div>
          <div className={styles.stepLabel}>{step.label}</div>
        </div>
      ))}
    </div>
  );
}
