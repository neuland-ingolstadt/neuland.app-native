---
outline: false
---

<script setup>
import { onMounted } from 'vue';
import  StoreLinksEn  from '../components/StoreLinksEn.vue';

function redirectBasedOnOS() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    window.location.href = "https://apps.apple.com/app/neuland-next/id1617096811";
  } else if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)) {
    window.location.href = "https://apps.apple.com/app/neuland-next/id1617096811";
  } else if (/android/i.test(userAgent)) {
    window.location.href = "https://play.google.com/store/apps/details?id=app.neuland";
  } else {
    document.getElementById("links").style.display = "block";
  }
}

onMounted(() => {
  redirectBasedOnOS();
});
</script>

<style module>
.links {
  display: flex;
  justify-content: center;
  gap: 7.5px;
  margin-top: 50px;
  margin-bottom: 60px;
}

.links img {
  height: 50px;
  width: auto; 
}

</style>

# Neuland Next

#### Neuland Next is available for iOS, Android, and MacOS.

<StoreLinksEn />

::: tip Download
If you are not automatically redirected, please click on the respective button above or visit the [Download page](/en/app/download) for more information.
:::
\
Visit our [homepage](/en/) for more information about Neuland Next and its features.
