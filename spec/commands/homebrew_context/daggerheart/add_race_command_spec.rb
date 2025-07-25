# frozen_string_literal: true

describe HomebrewContext::Daggerheart::AddRaceCommand do
  subject(:command_call) { instance.call({ user: user, name: name }) }

  let(:instance) { described_class.new }
  let!(:user) { create :user }
  let(:name) { 'Homunculus' }

  context 'for invalid params' do
    context 'for invalid name' do
      let(:name) { '' }

      it 'does not create race', :aggregate_failures do
        expect { command_call }.not_to change(Daggerheart::Homebrew::Race, :count)
        expect(command_call[:errors]).to eq({ name: ["Name can't be blank"] })
      end
    end
  end

  context 'for valid params' do
    it 'creates race', :aggregate_failures do
      expect { command_call }.to change(Daggerheart::Homebrew::Race, :count).by(1)
      expect(command_call[:errors]).to be_nil
    end
  end
end
