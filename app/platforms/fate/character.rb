# frozen_string_literal: true

module Fate
  class CharacterData
    include StoreModel::Model

    attribute :aspects, array: true, default: { 'concept' => '', 'trouble' => '', 'a' => '', 'b' => '', 'c' => '' }
    attribute :phase_trio, array: true, default: { 'a' => '', 'b' => '', 'c' => '' }
    attribute :skills_system, :string, default: 'core' # core/custom_skills
    attribute :custom_skills, array: true, default: []
    attribute :selected_skills, array: true, default: {}
  end

  class Character < Character
    def self.config
      @config ||= PlatformConfig.data('fate')
    end

    def self.skills
      config['skills']
    end

    attribute :data, Fate::CharacterData.to_type
  end
end
