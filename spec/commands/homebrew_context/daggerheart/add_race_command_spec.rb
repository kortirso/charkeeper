# frozen_string_literal: true

describe HomebrewContext::Daggerheart::AddRaceCommand do
  subject(:command_call) { instance.call({ user: user, name: name, domains: domains }.compact) }

  let(:instance) { described_class.new }
  let!(:user) { create :user }
  let(:name) { 'Homunculus' }
  let(:domains) { %w[arcana codex] }

  context 'for invalid params' do
    context 'for invalid domains count' do
      let(:domains) { %w[arcana] }

      it 'does not create race', :aggregate_failures do
        expect { command_call }.not_to change(Daggerheart::Homebrew::Race, :count)
        expect(command_call[:errors]).to eq({ domains: ['Domains list should contain 2 values'] })
      end
    end

    context 'for invalid domains value' do
      let(:domains) { %w[arcanio codexio] }

      it 'does not create race', :aggregate_failures do
        expect { command_call }.not_to change(Daggerheart::Homebrew::Race, :count)
        expect(command_call[:errors]).to eq({ domains: ['Domains list contains invalid value'] })
      end
    end
  end

  context 'for valid params' do
    it 'creates race', :aggregate_failures do
      expect { command_call }.to(
        change(Daggerheart::Homebrew::Race, :count).by(1)
          .and(change(user.homebrews, :count).by(1))
      )
      expect(command_call[:errors]).to be_nil
    end
  end
end
