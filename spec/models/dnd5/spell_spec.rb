# frozen_string_literal: true

describe Dnd5::Spell do
  it 'factory should be valid' do
    dnd5_spell = build :dnd5_spell

    expect(dnd5_spell).to be_valid
  end
end
