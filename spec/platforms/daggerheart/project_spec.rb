# frozen_string_literal: true

describe Daggerheart::Project do
  it 'factory should be valid' do
    character = create :character, :daggerheart

    daggerheart_project = build :daggerheart_project, character: character

    expect(daggerheart_project).to be_valid
  end
end
