class AddContiniousToFeats < ActiveRecord::Migration[8.0]
  def change
    add_column :feats, :continious, :boolean, default: false, comment: 'Имеет ли навык включаемый эффект'
    add_column :character_feats, :active, :boolean, default: false, comment: 'Включен ли эффект навыка'
  end
end
