# frozen_string_literal: true

describe CharactersContext::Dnd5::ChangeHealthCommand do
  subject(:command_call) { instance.call({ character: Dnd5::Character.find(character.id), value: value }) }

  let(:instance) { described_class.new }
  let!(:character) {
    create :character, data: {
      health: { max: 10, current: 1, temp: 1 },
      death_saving_throws: { success: 0, failure: 1 }
    }
  }

  context 'when healing' do
    context 'with simple heal' do
      let(:value) { 2 }

      it 'updates health', :aggregate_failures do
        command_call

        data = character.reload.data

        expect(data.health).to eq({ 'max' => 10, 'current' => 3, 'temp' => 1 })
        expect(data.death_saving_throws).to eq({ 'success' => 0, 'failure' => 0 })
      end
    end

    context 'with huge heal' do
      let(:value) { 10 }

      it 'updates health', :aggregate_failures do
        command_call

        data = character.reload.data

        expect(data.health).to eq({ 'max' => 10, 'current' => 10, 'temp' => 1 })
        expect(data.death_saving_throws).to eq({ 'success' => 0, 'failure' => 0 })
      end
    end
  end

  context 'when damaging' do
    context 'with small damage' do
      let(:value) { -1 }

      it 'updates health', :aggregate_failures do
        command_call

        data = character.reload.data

        expect(data.health).to eq({ 'max' => 10, 'current' => 1, 'temp' => 0 })
        expect(data.death_saving_throws).to eq({ 'success' => 0, 'failure' => 0 })
      end

      context 'when current health is 0' do
        before do
          character.data['health'] = { max: 10, current: 0, temp: 0 }
          character.save!
        end

        it 'updates health', :aggregate_failures do
          command_call

          data = character.reload.data

          expect(data.health).to eq({ 'max' => 10, 'current' => 0, 'temp' => 0 })
          expect(data.death_saving_throws).to eq({ 'success' => 0, 'failure' => 2 })
        end

        context 'when too huge daamge' do
          let(:value) { -10 }

          it 'updates health', :aggregate_failures do
            command_call

            data = character.reload.data

            expect(data.health).to eq({ 'max' => 10, 'current' => 0, 'temp' => 0 })
            expect(data.death_saving_throws).to eq({ 'success' => 0, 'failure' => 3 })
          end
        end
      end
    end

    context 'with letal damage' do
      let(:value) { -2 }

      it 'updates health', :aggregate_failures do
        command_call

        data = character.reload.data

        expect(data.health).to eq({ 'max' => 10, 'current' => 0, 'temp' => 0 })
        expect(data.death_saving_throws).to eq({ 'success' => 0, 'failure' => 0 })
      end
    end

    context 'with huge letal damage' do
      let(:value) { -12 }

      it 'updates health', :aggregate_failures do
        command_call

        data = character.reload.data

        expect(data.health).to eq({ 'max' => 10, 'current' => 0, 'temp' => 0 })
        expect(data.death_saving_throws).to eq({ 'success' => 0, 'failure' => 3 })
      end
    end
  end
end
