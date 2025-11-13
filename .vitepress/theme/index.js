import DefaultTheme from 'vitepress/theme'
import FeedbackForm from './components/FeedbackForm.vue'
import FeedbackAdmin from './components/FeedbackAdmin.vue'

export default {
    ...DefaultTheme,
    enhanceApp({ app }) {
        app.component('FeedbackForm', FeedbackForm)
        app.component('FeedbackAdmin', FeedbackAdmin)
    }
}