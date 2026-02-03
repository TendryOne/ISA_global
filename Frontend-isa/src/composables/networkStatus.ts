import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useNetworkStatus() {
  const isOnline = ref(navigator.onLine);

  function updateStatus() {
    isOnline.value = navigator.onLine;
  }

  onMounted(() => {
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("online", updateStatus);
    window.removeEventListener("offline", updateStatus);
  });

  return { isOnline };
}
