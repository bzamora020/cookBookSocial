import React from "react";

import { XCircleIcon } from "@heroicons/react/solid";

import { useAuth } from "../../contexts/AuthContext";
import styles from "./ErrorMessage.module.css"

export default function ErrorMessage() {
  const { error, setError } = useAuth();

  return (

    error && (
      <div className={styles.messageContainer}>

        <div className={styles.iconText}>

          <div className={styles.iconStyle}>
            <XCircleIcon
              onClick={() => setError("")}
              aria-hidden="true"
            />
          </div>
          <div className={styles.errorText}>
            <h5>
              Error: {error}
            </h5>
          </div>
        </div>

      </div>
    )
  );
}
