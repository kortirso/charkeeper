# frozen_string_literal: true

describe CharactersContext::Daggerheart::AddCompanionCommand do
  subject(:command_call) { instance.call({ character: Daggerheart::Character.find(character.id), name: name }.compact) }

  let(:instance) { described_class.new }
  let!(:character) { create :character, :daggerheart }
  let(:name) { 'Companion' }

  context 'for invalid params' do
    it 'does not create companion', :aggregate_failures do
      expect { command_call }.not_to change(character, :companion)
      expect(command_call[:errors]).to eq({ character: ['Only ranger subclass beastbound can have companion'] })
    end
  end

  context 'for valid params' do
    before do
      character.data['subclasses'] = { ranger: 'beastbound' }
      character.save
    end

    it 'creates companion', :aggregate_failures do
      expect { command_call }.to change(Daggerheart::Character::Companion, :count).by(1)
      expect(command_call[:errors]).to be_nil
    end
  end
end
