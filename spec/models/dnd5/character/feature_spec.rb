# frozen_string_literal: true

describe Dnd5::Character::Feature do
  it 'factory should be valid' do
    dnd5_character_feature = build :dnd5_character_feature, :bardic_inspiration

    expect(dnd5_character_feature).to be_valid
  end
end
