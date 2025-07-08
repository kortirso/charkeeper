# frozen_string_literal: true

describe Character::Feat do
  it 'factory should be valid' do
    character_feat = build :character_feat

    expect(character_feat).to be_valid
  end
end
