class AddUpvotesCounters < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def up
    add_column :homebrews, :upvotes_count, :integer, null: false, default: 0
    add_column :homebrew_books, :upvotes_count, :integer, null: false, default: 0

    ::Homebrew.find_each do |item|
      ::Homebrew.update_counters(item.id, upvotes_count: item.upvotes.size)
    end

    ::Homebrew::Book.find_each do |item|
      ::Homebrew::Book.update_counters(item.id, upvotes_count: item.upvotes.size)
    end
  end

  def down
    safety_assured do
      remove_column :homebrews, :upvotes_count
      remove_column :homebrew_books, :upvotes_count
    end
  end
end
