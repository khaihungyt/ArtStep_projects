import CustomDesignTool from "@/components/custom-design-tool"

export default function CreateDesignPage() {
    return (
        <div className="container px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Create Your Design</h1>
            <p className="text-muted-foreground mb-8">
                Start from scratch and create your own custom design.
            </p>

            <div className="mt-8">
                <CustomDesignTool />
            </div>
        </div>
    )
}
