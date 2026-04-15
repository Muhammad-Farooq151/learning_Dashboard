import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

/**
 * Must sit above MUI Dialog (theme zIndex.modal ~1.999M) and admin nav loader (999999).
 * Inline zIndex from mixin alone can lose to MUI portal stacking — globals.css enforces layer.
 */
const SWAL_Z = 2_147_483_000;

Swal.mixin({
  zIndex: SWAL_Z,
});
