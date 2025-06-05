import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DesignTemplates from "@/components/design-templates"
import CustomDesignTool from "@/components/custom-design-tool"

export default function CreateDesignPage() {
  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Create Your Design</h1>
      <p className="text-muted-foreground mb-8">
        Choose from our templates or create your own custom design from scratch.
      </p>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
          <TabsTrigger value="templates">Use a Template</TabsTrigger>
          <TabsTrigger value="custom">Create Custom Design</TabsTrigger>
        </TabsList>
        <TabsContent value="templates" className="mt-8">
          <DesignTemplates />
        </TabsContent>
        <TabsContent value="custom" className="mt-8">
          <CustomDesignTool />
        </TabsContent>
      </Tabs>
    </div>
  )
}
