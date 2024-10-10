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
import { ScrollArea } from "@/components/ui/scroll-area";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
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

import { PartsTable } from "./PartsTable";
import { calculatePartsSummary } from "../utils/partsSummaryCalculator";
import { useProcessPurchase } from "../api/processPurchase";
const purchaseItemSchema = z.object({
	type: z.enum(["product", "part"]),
	id: z.string().min(1, "Please select an item"),
	quantity: z.number().min(1, "Quantity must be at least 1"),
});

const formSchema = z.object({
	purchase_items: z.array(purchaseItemSchema).min(1, "Add at least one item"),
	parts_summary: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			partsBefore: z.number(),
			partsChange: z.number(),
			partsAfter: z.number(),
		}),
	),
});

export type PurchaseFormData = z.infer<typeof formSchema>;

interface PurchaseFormProps {
	products: {
		uuid: string;
		name: string;
		parts: { uuid: string; quantity: number }[];
	}[];
	parts: { uuid: string; name: string; quantity: number }[];
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({
	products,
	parts,
}) => {
	const { mutate: processPurchase } = useProcessPurchase();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			purchase_items: [{ type: "product", id: "", quantity: 1 }],
			parts_summary: parts.map((part) => ({
				id: part.uuid,
				name: part.name,
				partsBefore: part.quantity,
				partsChange: 0,
				partsAfter: part.quantity,
			})),
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "purchase_items",
	});

	// Use useWatch instead of form.watch
	const purchaseItems = useWatch({
		control: form.control,
		name: "purchase_items",
	});

	const partsSummary = useWatch({
		control: form.control,
		name: "parts_summary",
	});

	useEffect(() => {
		const newPartsSummary = calculatePartsSummary(
			purchaseItems,
			products,
			parts,
		);
		console.log("New parts summary:", newPartsSummary);
		form.setValue("parts_summary", newPartsSummary);
	}, [purchaseItems, products, parts]);

	const partIsNegative = partsSummary.some((part) => part.partsAfter < 0);

	const onSubmit = (data: z.infer<typeof formSchema>) => {
		processPurchase(data);
	};

	return (
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
					{fields.map((field, index) => (
						<div key={field.id} className="space-y-2 px-1">
							<FormField
								control={form.control}
								name={`purchase_items.${index}.type`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Type</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="product">Product</SelectItem>
												<SelectItem value="part">Part</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name={`purchase_items.${index}.id`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{form.watch(`purchase_items.${index}.type`) === "product"
												? "Product"
												: "Part"}
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue
														placeholder={`Select ${
															form.watch(`purchase_items.${index}.type`) ===
															"product"
																? "product"
																: "part"
														}`}
													/>
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{form.watch(`purchase_items.${index}.type`) ===
												"product"
													? products.map((product) => (
															<SelectItem
																key={product.uuid}
																value={product.uuid}
															>
																{product.name}
															</SelectItem>
														))
													: parts.map((part) => (
															<SelectItem key={part.uuid} value={part.uuid}>
																{part.name}
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
								name={`purchase_items.${index}.quantity`}
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
									type="button"
									onClick={() => remove(index)}
									variant="destructive"
									size="sm"
								>
									Remove
								</Button>
							)}
						</div>
					))}

					<div className="flex gap-2">
						<Button
							type="button"
							variant="secondary"
							size="sm"
							onClick={() => append({ type: "product", id: "", quantity: 1 })}
						>
							Add Product
						</Button>
						<Button
							type="button"
							variant="secondary"
							size="sm"
							onClick={() => append({ type: "part", id: "", quantity: 1 })}
						>
							Add Part
						</Button>
					</div>

					<Button disabled={partIsNegative} type="submit">
						Create Purchase
					</Button>
				</form>
			</Form>
			<hr className="my-4" />
			<PartsTable partsSummary={partsSummary} />
		</>
	);
};
