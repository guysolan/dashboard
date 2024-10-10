import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { SaleSummary } from "./SaleSummary";

const saleItemSchema = z.object({
	id: z.string().min(1, "Product is required"),
	quantity: z.number().min(1, "Quantity must be at least 1"),
});

const formSchema = z.object({
	saleItems: z.array(saleItemSchema).min(1, "Add at least one product"),
});

interface SaleFormProps {
	products: { id: string; name: string }[];
	handleCreateSale: (data: z.infer<typeof formSchema>) => void;
}

export const SaleForm: React.FC<SaleFormProps> = ({
	products,
	handleCreateSale,
}) => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			saleItems: [{ id: "", quantity: 1 }],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "saleItems",
	});

	const saleItems = useWatch({
		control: form.control,
		name: "saleItems",
	});

	useEffect(() => {
		console.log("Sale items updated:", saleItems);
	}, [saleItems]);

	const onSubmit = (data: z.infer<typeof formSchema>) => {
		handleCreateSale(data);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<div className="gap-4 grid py-4">
					{fields.map((field, index) => (
						<div key={field.id} className="gap-2 grid px-1">
							<FormField
								control={form.control}
								name={`saleItems.${index}.id`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Product</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select product" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{products.map((product) => (
													<SelectItem
														key={product.id}
														value={product.id.toString()}
													>
														{product.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name={`saleItems.${index}.quantity`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Quantity</FormLabel>
										<FormControl>
											<Input
												type="number"
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{fields.length > 1 && (
								<Button
									onClick={() => remove(index)}
									variant="destructive"
									size="sm"
									type="button"
								>
									Remove
								</Button>
							)}
						</div>
					))}
					<Button
						type="button"
						variant="secondary"
						size="sm"
						onClick={() => append({ id: "", quantity: 1 })}
					>
						Add Product
					</Button>
				</div>
				<SaleSummary saleItems={saleItems} products={products} />
				<Button type="submit">Create Sale</Button>
			</form>
		</Form>
	);
};
