# frozen_string_literal: true

describe Spell do
  it 'factory should be valid' do
    spell = build :spell

    expect(spell).to be_valid
  end
end
