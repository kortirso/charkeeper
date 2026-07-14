class AddUpvotesCounters3 < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def up
    add_column :feats, :upvotes_count, :integer, null: false, default: 0

    ::Feat.find_each do |item|
      ::Feat.update_counters(item.id, upvotes_count: item.upvotes.size)
    end
  end

  def down
    safety_assured do
      remove_column :feats, :upvotes_count
    end
  end
end
