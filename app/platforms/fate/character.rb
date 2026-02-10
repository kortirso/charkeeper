# frozen_string_literal: true

module Fate
  class CharacterData
    include StoreModel::Model

    attribute :aspects, array: true, default: { 'concept' => '', 'trouble' => '', 'a' => '', 'b' => '', 'c' => '' }
    attribute :phase_trio, array: true, default: { 'a' => '', 'b' => '', 'c' => '' }
    attribute :skills_system, :string, default: 'core' # core/custom_skills/approaches
    attribute :custom_skills, array: true, default: []
    attribute :selected_skills, array: true, default: {}
    attribute :stress_system, :string, default: 'core' # core 1234 / condensed 111111
    attribute :custom_stress, array: true, default: []
    attribute :selected_stress, array: true, default: {} # physical 3, mental: 3
    attribute :consequences, array: true, default: {} # mild,moderate,severe, physical/mental
    attribute :stunts, array: true, default: [] # [{ id: 1, title: '', description: '', skill: nil }]
  end

  class Character < Character
    def self.config
      @config ||= PlatformConfig.data('fate')
    end

    def self.skills
      config['skills']
    end

    attribute :data, Fate::CharacterData.to_type

    def decorator
      ::FateCharacter::BaseDecorator.new(self)
    end
  end
end
