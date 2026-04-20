class BackfillDhDicesForFeats < ActiveRecord::Migration[8.1]
  def change
    [
      ['dedicated', 'hope_dice', 'D20'],
      ['rise_to_the_challenge', 'hope_dice', 'D20'],
      ['reliable_backup', 'hope_dice', 'D20'],
      ['tactician', 'hope_dice', 'D20'],
      ['signature-move', 'hope_dice', 'D20'],
      ['feed', 'fear_dice', 'D20']
    ].each do |item|
      feat = Daggerheart::Feat.find_by(slug: item[0])
      next unless feat

      feat.update(info: (feat.info || {}).merge(item[1] => item[2]))
    end
  end
end
