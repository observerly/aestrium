import { defineCustomElement } from 'vue'

import SkyViewer from './SkyViewer.vue'

const SkyViewerElement = defineCustomElement(SkyViewer)

customElements.define('-sky-viewer', SkyViewerElement)

export { SkyViewerElement }
