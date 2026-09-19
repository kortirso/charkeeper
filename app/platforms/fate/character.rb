# frozen_string_literal: true

module Fate
  class CharacterData
    include StoreModel::Model

    attribute :aspects, array: true, default: { 'concept' => '', 'trouble' => '', 'a' => '', 'b' => '', 'c' => '' }
    attribute :phase_trio, array: true, default: { 'a' => '', 'b' => '', 'c' => '' }
    attribute :custom_stress, array: true, default: []
    attribute :selected_stress, array: true, default: {} # physical 3, mental: 3
    attribute :consequences, array: true, default: {} # mild,moderate,severe, physical/mental
    attribute :stunts, array: true, default: [] # [{ id: 1, title: '', description: '', skill: nil, approach: nil }]
    attribute :fate_points, :integer, default: 0
    # skills
    attribute :selected_skills, array: true, default: {}
    attribute :selected_approaches, array: true, default: {}
    attribute :additional_skills, array: true, default: {}
    # system settings
    attribute :skills_system, :string, default: 'core' # core/approaches
    attribute :stress_system, :string, default: 'core' # core 1234 / condensed 111111
  end

  class Character < Character
    attribute :data, Fate::CharacterData.to_type

    def decorator(simple: false, version: nil)
      FateDecorator.new.call(character: self, simple: simple, version: version)
    end
  end
end
