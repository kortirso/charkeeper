# frozen_string_literal: true

describe CharactersContext::Dnd2024::Bonuses::AddV3Command do
  subject(:command_call) { instance.call(params) }

  let(:instance) { described_class.new }
  let(:character) { create :character, :dnd2024 }
  let(:params) { { bonusable: Dnd2024::Character.find(character.id), comment: 'Name', value: value } }

  context 'for abilities' do
    context 'for invalid ability type' do
      let(:value) { { 'str' => { 'type' => 'set', 'value' => 1 } } }

      it 'returns error', :aggregate_failures do
        expect { command_call }.not_to change(Character::Bonus, :count)
        expect(command_call.dig(:errors_list, 0)).to eq 'Only ADD type is available'
      end
    end

    context 'for invalid ability value with variables' do
      let(:value) { { 'str' => { 'type' => 'add', 'value' => 'level + 1' } } }

      it 'returns error', :aggregate_failures do
        expect { command_call }.not_to change(Character::Bonus, :count)
        expect(command_call.dig(:errors_list, 0)).to eq 'Invalid formula'
      end
    end

    context 'for valid params' do
      let(:value) { { 'str' => { 'type' => 'add', 'value' => '1' } } }

      it 'returns error', :aggregate_failures do
        expect { command_call }.to change(Character::Bonus, :count).by(1)
      end
    end
  end

  context 'for attacks' do
    context 'for invalid ability type' do
      let(:value) { { 'attack' => { 'type' => 'set', 'value' => 1 } } }

      it 'returns error', :aggregate_failures do
        expect { command_call }.not_to change(Character::Bonus, :count)
        expect(command_call.dig(:errors_list, 0)).to eq 'Only ADD type is available'
      end
    end

    context 'for invalid ability value with variables' do
      let(:value) { { 'attack' => { 'type' => 'add', 'value' => 'invalid + 1' } } }

      it 'returns error', :aggregate_failures do
        expect { command_call }.not_to change(Character::Bonus, :count)
        expect(command_call.dig(:errors_list, 0)).to eq 'Invalid formula'
      end
    end

    context 'for valid params without formula' do
      let(:value) { { 'attack' => { 'type' => 'add', 'value' => '1' } } }

      it 'returns error', :aggregate_failures do
        expect { command_call }.to change(Character::Bonus, :count).by(1)
      end
    end

    context 'for valid params with formula' do
      let(:value) { { 'attack' => { 'type' => 'add', 'value' => 'level + 1' } } }

      it 'returns error', :aggregate_failures do
        expect { command_call }.to change(Character::Bonus, :count).by(1)
      end
    end
  end

  context 'for speed' do
    context 'for invalid ability value with variables' do
      let(:value) { { 'speed' => { 'type' => 'add', 'value' => 'invalid + 1' } } }

      it 'returns error', :aggregate_failures do
        expect { command_call }.not_to change(Character::Bonus, :count)
        expect(command_call.dig(:errors_list, 0)).to eq 'Invalid formula'
      end
    end

    context 'for valid params with set type' do
      let(:value) { { 'speed' => { 'type' => 'set', 'value' => '40' } } }

      it 'returns error', :aggregate_failures do
        expect { command_call }.to change(Character::Bonus, :count).by(1)
      end
    end

    context 'for valid params with set type and formula' do
      let(:value) { { 'speed' => { 'type' => 'set', 'value' => 'level * 10' } } }

      it 'returns error', :aggregate_failures do
        expect { command_call }.to change(Character::Bonus, :count).by(1)
      end
    end

    context 'for valid params without formula' do
      let(:value) { { 'speed' => { 'type' => 'add', 'value' => '1' } } }

      it 'returns error', :aggregate_failures do
        expect { command_call }.to change(Character::Bonus, :count).by(1)
      end
    end

    context 'for valid params with formula' do
      let(:value) { { 'speed' => { 'type' => 'add', 'value' => 'level + 1' } } }

      it 'returns error', :aggregate_failures do
        expect { command_call }.to change(Character::Bonus, :count).by(1)
      end
    end
  end
end
