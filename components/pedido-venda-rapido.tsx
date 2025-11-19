"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import PedidoVendaFromLead from "@/components/pedido-venda-from-lead"
import { toast } from "sonner"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"

interface PedidoVendaRapidoProps {
  isOpen: boolean
  onClose: () => void
}

// Este componente já utiliza PedidoVendaFromLead, que será atualizado com a nova metodologia
export default function PedidoVendaRapido({ isOpen, onClose }: PedidoVendaRapidoProps) {
  const [codVendUsuario, setCodVendUsuario] = useState("0")
  const [pedido, setPedido] = useState<any>(null) // Estado para os dados do pedido
  const [vendedores, setVendedores] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const salvarPedidoRef = useRef<(() => Promise<boolean>) | null>(null)

  useEffect(() => {
    if (isOpen) {
      carregarVendedorUsuario()
      carregarVendedores()
    }
  }, [isOpen])

  const carregarVendedores = async () => {
    try {
      const response = await fetch('/api/vendedores?tipo=vendedores')
      if (response.ok) {
        const data = await response.json()
        setVendedores(data)
      }
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error)
    }
  }

  const carregarVendedorUsuario = () => {
    try {
      const userStr = document.cookie
        .split('; ')
        .find(row => row.startsWith('user='))
        ?.split('=')[1]

      if (userStr) {
        const user = JSON.parse(decodeURIComponent(userStr))

        if (user.codVendedor) {
          setCodVendUsuario(String(user.codVendedor))
          console.log('✅ Vendedor do usuário carregado:', user.codVendedor)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar vendedor do usuário:', error)
    }
  }

  const dadosIniciais = {
    CODEMP: "1",
    CODCENCUS: "0",
    NUNOTA: "",
    MODELO_NOTA: "",
    DTNEG: new Date().toISOString().split('T')[0],
    DTFATUR: "",
    DTENTSAI: "",
    CODPARC: "",
    CODTIPOPER: "974",
    TIPMOV: "P",
    CODTIPVENDA: "1",
    CODVEND: codVendUsuario,
    OBSERVACAO: "",
    VLOUTROS: 0,
    VLRDESCTOT: 0,
    VLRFRETE: 0,
    TIPFRETE: "S",
    ORDEMCARGA: "",
    CODPARCTRANSP: "0",
    PERCDESC: 0,
    CODNAT: "0",
    TIPO_CLIENTE: "PJ",
    CPF_CNPJ: "",
    IE_RG: "",
    RAZAO_SOCIAL: "", // Campo correto
    itens: []
  }

  // Inicializa o estado do pedido com os dados iniciais
  useEffect(() => {
    setPedido(dadosIniciais)
  }, [codVendUsuario]) // Atualiza quando codVendUsuario muda

  const handlePedidoSucesso = () => {
    toast.success("Pedido criado com sucesso!")
    onClose()
  }

  const handleCancelar = () => {
    onClose()
  }

  const handleCriarPedido = async () => {
    if (!salvarPedidoRef.current) {
      toast.error("Erro ao criar pedido. Tente novamente.")
      return
    }

    setLoading(true)
    try {
      const sucesso = await salvarPedidoRef.current()
      if (sucesso) {
        handlePedidoSucesso()
      }
    } catch (error) {
      console.error("Erro ao criar pedido:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-4 md:px-6 py-3 md:py-4 border-b flex-shrink-0">
          <DialogTitle className="text-base md:text-lg">Criar Pedido de Venda Rápido</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 pb-20">
          {pedido && ( // Renderiza PedidoVendaFromLead apenas se pedido tiver sido inicializado
            <PedidoVendaFromLead
              dadosIniciais={pedido} // Passa o estado 'pedido' atualizado
              onSuccess={handlePedidoSucesso}
              onCancel={handleCancelar}
              onSalvarPedido={(salvarFn) => {
                salvarPedidoRef.current = salvarFn
              }}
              isLeadVinculado={false} // Pedido Rápido é INDEPENDENTE, sem vínculo com lead
            />
          )}
        </div>
        <div className="border-t px-4 md:px-6 py-3 md:py-4 flex-shrink-0 bg-background">
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelar}
              className="min-w-[100px]"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="min-w-[100px] bg-green-600 hover:bg-green-700"
              onClick={handleCriarPedido}
              disabled={loading}
            >
              {loading ? "Criando..." : "Criar Pedido"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}