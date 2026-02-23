# frozen_string_literal: true

describe CharactersContext::Daggerheart::ChangeCompanionCommand do
  subject(:command_call) do
    instance.call(
      { companion: Daggerheart::Character::Companion.find(companion.id), name: name, stress_marked: 1 }
    )
  end

  let(:instance) { described_class.new }
  let!(:character) { create :character, :daggerheart }
  let!(:companion) { create :character_companion, :daggerheart, character: character }
  let(:name) { 'Compy' }

  it 'updates companion', :aggregate_failures do
    command_call

    expect(companion.reload.name).to eq 'Compy'
    expect(companion.data.stress_marked).to eq 1
    expect(command_call[:errors_list]).to be_nil
  end
end
