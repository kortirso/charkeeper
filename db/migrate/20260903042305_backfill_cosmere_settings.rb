class BackfillCosmereSettings < ActiveRecord::Migration[8.1]
  def change
    Cosmere::Character.find_each do |character|
      character.data.setting = 'roshar'
      character.save
    end
  end
end
