class CreateUpvotes < ActiveRecord::Migration[8.1]
  def up
    create_table :upvotes, id: :uuid do |t|
      t.uuid :user_id, null: false
      t.uuid :upvoteable_id, null: false
      t.string :upvoteable_type, null: false
      t.timestamps
    end
    add_index :upvotes, :user_id
    add_index :upvotes, [:upvoteable_id, :upvoteable_type], unique: true

    add_column :homebrew_communities, :upvotes_count, :integer, null: false, default: 0

    ::Homebrew::Community.reset_column_information
    ::Homebrew::Community.find_each do |object|
      ::Homebrew::Community.update_counters object.id, upvotes_count: object.upvotes.size
    end
  end

  def down
    safety_assured do
      remove_column :homebrew_communities, :upvotes_count
      drop_table :upvotes
    end
  end
end
