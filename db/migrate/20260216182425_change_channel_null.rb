class ChangeChannelNull < ActiveRecord::Migration[8.1]
  def up
    safety_assured { change_column_null :channels, :external_id, true }
  end

  def down
    safety_assured { change_column_null :channels, :external_id, false }
  end
end
