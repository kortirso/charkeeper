# frozen_string_literal: true

describe Dnd2024Decorator do
  subject(:decorator) {
    described_class.new.call(character: character_record)
  }

  let!(:character) {
    create(:character,
           :dnd2024,
           'data' => {
             'level' => 4,
             'main_class' => 'bard',
             'species' => 'orc',
             'classes' => { 'bard' => 4 },
             'subclasses' => { 'bard' => nil },
             'abilities' => { 'str' => 8, 'dex' => 13, 'con' => 10, 'int' => 12, 'wis' => 14, 'cha' => 15 },
             'speed' => 30
           })
  }
  let!(:character_record) { Character.find(character.id) }

  before do
    create :character_bonus,
           bonusable: character,
           enabled: true,
           value: {
             'str' => { 'type' => 'add', 'value' => 1 },
             'dex' => { 'type' => 'set', 'value' => 19 },
             'initiative' => { 'type' => 'add', 'value' => 2 },
             'darkvision' => { 'type' => 'add', 'value' => 30 }
           }

    torch = create :item,
                   modifiers: {
                     'speed' => { 'type' => 'set', 'value' => 40 },
                     'initiative' => { 'type' => 'set', 'value' => 'dex + proficiency_bonus' },
                     'attack' => { 'type' => 'add', 'value' => 2 }
                   }
    melee_weapon = create :item,
                          name: { en: 'Melee', ru: 'Рукопашное' },
                          kind: 'weapon',
                          info: { type: 'melee', caption: [], damage: '1d6' },
                          modifiers: { 'damage' => { 'type' => 'add', 'value' => 2 } }

    create :character_item, character: character, item: torch, states: Character::Item.default_states.merge('hands' => 1)
    create :character_item, character: character, item: melee_weapon, states: Character::Item.default_states.merge('hands' => 1)

    thrown_weapon = create(:item,
                           kind: 'weapon',
                           name: { en: 'Thrown', ru: 'Метательное' },
                           info: { damage: '1d6', type: 'thrown', caption: [] })
    range_weapon = create(:item,
                          kind: 'weapon',
                          name: { en: 'Range', ru: 'Дистанционное' },
                          info: { damage: '1d6', type: 'range', caption: [] })
    create :character_item, character: character, item: thrown_weapon, states: Character::Item.default_states.merge('hands' => 1)
    create :character_item, character: character, item: range_weapon, states: Character::Item.default_states.merge('hands' => 1)

    feat = create :feat,
                  :dnd2024_bardic_inspiration,
                  modifiers: {
                    'cha' => { 'type' => 'add', 'value' => 1 },
                    'armor_class' => {
                      'type' => 'set', 'value' => 'if (no_body_armor, MAX(armor_class, 10 + dex + cha), armor_class)'
                    }
                  }
    create :character_feat, feat: feat, character: character, ready_to_use: true
  end

  50.times do
    context 'for random character' do
      let(:species_name) { Dnd2024::Character.species.keys.sample }
      let(:legacy_name) { Dnd2024::Character.species_info(species_name)['legacies'].keys.sample }
      let(:main_class_name) { Dnd2024::Character.classes_info.keys.sample }
      let(:subclass_name) { Dnd2024::Character.class_info(main_class_name)['subclasses'].keys.sample }

      before do
        character_record.data.species = species_name
        character_record.data.legacy = legacy_name if legacy_name
        character_record.data.main_class = main_class_name
        character_record.data.classes = { main_class_name => 4 }
        character_record.data.subclasses = { main_class_name => subclass_name }
        character_record.save!
      end

      it 'decorates character', :aggregate_failures do
        result = decorator

        expect(result.abilities['str']).to eq 8
        expect(result.abilities['cha']).to eq 15
        expect(result.modified_abilities['str']).to eq 9
        expect(result.modified_abilities['dex']).to eq 13
        expect(result.modified_abilities['cha']).to eq 16
        expect(result.armor_class >= 11).to be_truthy
        expect(result.speed >= 40).to be_truthy
        expect(result.initiative).to eq 5
        expect(result.darkvision >= 30).to be_truthy
      end
    end
  end

  context 'with active beastform' do
    before do
      character_record.data.beastform = 'spider'
      character_record.save!
    end

    it 'does not raise errors', :aggregate_failures do
      result = decorator

      expect(result.abilities['str']).to eq 8
      expect(result.modified_abilities['str']).to eq 9
      expect(result.modified_abilities['dex']).to eq 14
    end
  end
end
