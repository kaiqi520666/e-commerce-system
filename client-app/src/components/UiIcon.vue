<script setup>
import { computed } from 'vue'
import {
  ArrowRight,
  Bell,
  Blocks,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  CircleHelp,
  CircleUserRound,
  KeyRound,
  LoaderCircle,
  LogIn,
  LogOut,
  MailPlus,
  Package2,
  Smartphone,
  TicketPercent,
  TriangleAlert,
  ReceiptText,
  Search,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  X,
} from 'lucide-vue-next'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
})

const iconMap = {
  notice: Bell,
  category: Blocks,
  cart: ShoppingCart,
  orders: ReceiptText,
  profile: UserRound,
  arrow: ArrowRight,
  sparkles: Sparkles,
  shield: ShieldCheck,
  product: Package2,
  chevron: ChevronRight,
  filter: SlidersHorizontal,
  close: X,
  login: LogIn,
  register: MailPlus,
  confirm: CircleHelp,
  loading: LoaderCircle,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: CircleAlert,
  info: Bell,
  phone: Smartphone,
  account: CircleUserRound,
  password: KeyRound,
  invite: TicketPercent,
  logout: LogOut,
  search: Search,
}

const iconComponent = computed(() => iconMap[props.name] || Bell)
</script>

<template>
  <component :is="iconComponent" :size="18" :stroke-width="1.85" aria-hidden="true" />
</template>
