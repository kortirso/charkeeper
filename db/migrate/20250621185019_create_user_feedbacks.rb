class CreateUserFeedbacks < ActiveRecord::Migration[8.0]
  def change
    create_table :user_feedbacks, id: :uuid do |t|
      t.uuid :user_id, null: false
      t.text :value
      t.timestamps
    end
  end
end
