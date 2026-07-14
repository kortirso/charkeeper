class AddUpvotesCounters2 < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def up
    add_column :items, :upvotes_count, :integer, null: false, default: 0

    ::Item.find_each do |item|
      ::Item.update_counters(item.id, upvotes_count: item.upvotes.size)
    end
  end

  def down
    safety_assured do
      remove_column :items, :upvotes_count
    end
  end
end
