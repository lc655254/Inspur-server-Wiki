import DefaultTheme from 'vitepress/theme'
import FeedbackForm from './components/FeedbackForm.vue'

export default {
    ...DefaultTheme,
    enhanceApp({ app }) {
        app.component('FeedbackForm', FeedbackForm)
    }
}