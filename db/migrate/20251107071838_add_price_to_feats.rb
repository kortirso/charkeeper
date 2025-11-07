class AddPriceToFeats < ActiveRecord::Migration[8.1]
  def change
    add_column :feats, :price, :jsonb, default: {}, comment: 'Цена активации способности'

    Feat.update_all(price: {})
  end
end
