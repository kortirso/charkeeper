# frozen_string_literal: true

# rubocop: disable RSpec/LetSetup
describe CharactersContext::Daggerheart::Upgrade::PerformCommand do
  subject(:command_call) {
    instance.call({
      character: Daggerheart::Character.find(character.id),
      character_item: character_item,
      name: 'Name',
      state: state,
      upgrades: upgrades
    })
  }

  let(:instance) { described_class.new }
  let!(:character) { create :character, :daggerheart }
  let!(:weapon) { create :item, :daggerheart, kind: 'primary weapon', info: { trait: 'str' } }
  let!(:armor) { create :item, :daggerheart, kind: 'armor' }
  let!(:charm) { create :item, :daggerheart, kind: 'upgrade', info: { type: 'charm', feature: { en: '1', ru: '2' } } }
  let!(:stone) { create :item, :daggerheart, kind: 'upgrade', info: { type: 'stone', feature: { en: '3', ru: '4' } } }
  let!(:gem_upgrade) { create :item, :daggerheart, kind: 'upgrade', info: { type: 'gem', trait: 'agi' } }
  let!(:armor_stone) { create :item, :daggerheart, kind: 'upgrade', info: { type: 'armor_stone', feature: { en: '5', ru: '6' } } }

  context 'for weapon' do
    let(:state) { 'hands' }
    let!(:character_item) { create :character_item, character: character, item: weapon, states: { state => 2 } }

    context 'for empty upgrades' do
      let(:upgrades) { {} }

      it 'does not create item', :aggregate_failures do
        expect { command_call }.not_to change(Item, :count)
        expect(command_call[:errors_list]).not_to be_nil
      end
    end

    context 'for invalid key upgrade' do
      let(:upgrades) { { something: '1' } }

      it 'does not create item', :aggregate_failures do
        expect { command_call }.not_to change(Item, :count)
        expect(command_call[:errors_list]).not_to be_nil
      end
    end

    context 'for unexisting gem' do
      let(:upgrades) { { gem: 'unexisting' } }

      it 'creates item with default values', :aggregate_failures do
        expect { command_call }.to(
          change(Item, :count).by(1)
            .and(change(Character::Item, :count).by(1))
        )
        expect(command_call[:errors_list]).to be_nil
        expect(Item.last.info['trait']).to eq 'str'
      end
    end

    context 'when valid request' do
      let(:upgrades) { { gem: gem_upgrade.id } }

      it 'creates item', :aggregate_failures do
        expect { command_call }.to(
          change(Item, :count).by(1)
            .and(change(Character::Item, :count).by(1))
        )
        expect(command_call[:errors_list]).to be_nil
        expect(Item.last.info['trait']).to eq 'agi'
      end

      context 'when gem is present in storage' do
        let!(:gem_item) { create :character_item, character: character, item: gem_upgrade, states: { state => 2 } }

        it 'creates item', :aggregate_failures do
          expect { command_call }.to(
            change(Item, :count).by(1)
              .and(change(Character::Item, :count).by(1))
          )
          expect(command_call[:errors_list]).to be_nil
          expect(Item.last.info['trait']).to eq 'agi'
          expect(gem_item.reload.states).to eq({ state => 1 })
        end
      end
    end

    context 'with stone upgrade' do
      let(:upgrades) { { gem: gem_upgrade.id, stone: stone.id } }

      it 'creates item', :aggregate_failures do
        expect { command_call }.to(
          change(Item, :count).by(1)
            .and(change(Character::Item, :count).by(1))
        )
        expect(command_call[:errors_list]).to be_nil

        item = Item.last
        expect(item.info['trait']).to eq 'agi'
        expect(item.info['features']).to eq([{ 'en' => '3', 'ru' => '4' }])
      end

      context 'when weapon has feature' do
        before do
          weapon.info['features'] = { 'en' => '0', 'ru' => '0' }
          weapon.save!
        end

        it 'does not create item', :aggregate_failures do
          expect { command_call }.not_to change(Item, :count)
          expect(command_call[:errors_list]).not_to be_nil
        end
      end
    end

    context 'with full upgrade' do
      let(:upgrades) { { gem: gem_upgrade.id, stone: stone.id, charm: charm.id } }

      it 'creates item', :aggregate_failures do
        expect { command_call }.to(
          change(Item, :count).by(1)
            .and(change(Character::Item, :count).by(1))
        )
        expect(command_call[:errors_list]).to be_nil

        item = Item.last
        expect(item.info['trait']).to eq 'agi'
        expect(item.info['features']).to eq([{ 'en' => '3', 'ru' => '4' }, { 'en' => '1', 'ru' => '2' }])
      end
    end
  end

  context 'for armor' do
    let(:state) { 'equipment' }
    let!(:character_item) { create :character_item, character: character, item: armor, states: { state => 2 } }

    context 'for empty upgrades' do
      let(:upgrades) { {} }

      it 'does not create item', :aggregate_failures do
        expect { command_call }.not_to change(Item, :count)
        expect(command_call[:errors_list]).not_to be_nil
      end
    end

    context 'for invalid key upgrade' do
      let(:upgrades) { { something: '1' } }

      it 'does not create item', :aggregate_failures do
        expect { command_call }.not_to change(Item, :count)
        expect(command_call[:errors_list]).not_to be_nil
      end
    end

    context 'for unexisting armor_stone' do
      let(:upgrades) { { armor_stone: 'unexisting' } }

      it 'creates item with default values', :aggregate_failures do
        expect { command_call }.to(
          change(Item, :count).by(1)
            .and(change(Character::Item, :count).by(1))
        )
        expect(command_call[:errors_list]).to be_nil
        expect(Item.last.info['features']).to be_nil
      end
    end

    context 'when valid request' do
      let(:upgrades) { { armor_stone: armor_stone.id } }

      it 'creates item', :aggregate_failures do
        expect { command_call }.to(
          change(Item, :count).by(1)
            .and(change(Character::Item, :count).by(1))
        )
        expect(command_call[:errors_list]).to be_nil
        expect(Item.last.info['features']).to eq([{ 'en' => '5', 'ru' => '6' }])
      end

      context 'when armor has feature' do
        before do
          armor.info['features'] = { 'en' => '0', 'ru' => '0' }
          armor.save!
        end

        it 'does not create item', :aggregate_failures do
          expect { command_call }.not_to change(Item, :count)
          expect(command_call[:errors_list]).not_to be_nil
        end
      end
    end
  end
end
# rubocop: enable RSpec/LetSetup
