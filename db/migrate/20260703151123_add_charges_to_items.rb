class AddChargesToItems < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def up
    add_column :items, :charges, :integer
    add_column :character_items, :charges, :integer

    safety_assured do
      remove_column :character_items, :quantity
      remove_column :character_items, :ready_to_use
    end
  end

  def down
    safety_assured do
      remove_column :items, :charges
      remove_column :character_items, :charges

      add_column :character_items, :quantity, :integer
      add_column :character_items, :ready_to_use, :boolean
    end
  end
end
