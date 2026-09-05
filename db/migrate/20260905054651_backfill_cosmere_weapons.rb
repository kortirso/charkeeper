class BackfillCosmereWeapons < ActiveRecord::Migration[8.1]
  def up
    Cosmere::Item.where(kind: %w[weapon armor]).find_each do |item|
      item.info['only'] = ['roshar']
      item.save
    end
  end

  def down; end
end
