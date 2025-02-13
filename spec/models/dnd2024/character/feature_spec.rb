# frozen_string_literal: true

describe Dnd2024::Character::Feature do
  it 'factory should be valid' do
    dnd2024_character_feature = build :dnd2024_character_feature, :bardic_inspiration

    expect(dnd2024_character_feature).to be_valid
  end
end
