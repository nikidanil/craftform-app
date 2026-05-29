import styles from './BackgroundBlobs.module.css';

export const BackgroundBlobs = () => (
	<div className={styles.blobs} aria-hidden="true">
		<span className={`${styles.blob} ${styles.blobOne}`} />
		<span className={`${styles.blob} ${styles.blobTwo}`} />
		<span className={`${styles.blob} ${styles.blobThree}`} />
	</div>
);
