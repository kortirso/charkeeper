# frozen_string_literal: true

module Cosmere
  class CharacterData
    include StoreModel::Model

    attribute :setting, :string # roshar, scadrial_1, scadrial_2
    attribute :level, :integer, default: 1
    attribute :ancestry, :string
    attribute :cultures, array: true, default: []
    attribute :path, :string
    attribute :abilities, array: true, default: { 'str' => 0, 'spd' => 0, 'int' => 0, 'wil' => 0, 'awa' => 0, 'pre' => 0 }
    attribute :health, :integer, default: 10
    attribute :health_max, :integer, default: 10
    attribute :focus, :integer, default: 2
    attribute :investiture, :integer, default: 0
    attribute :selected_skills, array: true, default: {} # { 'acrobatics' => 2, 'arcana' => 1, 'crafting' => 3, 'id' => 1 }
    attribute :additional_skills, array: true, default: {} # { 'id' => { 'name' => '', 'ability' => 'str' } }
    attribute :expertises, array: true, default: { 'weapon' => [], 'armor' => [], 'culture' => [] }
    attribute :custom_expertises, array: true, default: [] # [{ 'name' => '', 'desc' => '' }]
    attribute :purpose, :string
    attribute :obstacle, :string
    attribute :goals, array: true, default: [] # [{ id: 1, text: '', counter: 0 }]
    attribute :connections, array: true, default: [] # [{ id: 1, text: '' }]
    attribute :singer_form, :string, default: 'dullform'
    # для левелинга
    attribute :attribute_points, :integer
    attribute :skill_points, :integer
    attribute :guide_step, :integer # этап помощи при создании персонажа
  end

  class Character < Character
    attribute :data, Cosmere::CharacterData.to_type

    def self.config
      PlatformConfig.data('cosmere')
    end

    def self.abilities
      config['abilities']
    end

    def self.ancestries
      config['ancestries']
    end

    def self.ancestry_info(race_value)
      config.dig('ancestries', race_value)
    end

    def self.paths_info(path_value)
      config.dig('paths', path_value)
    end

    def self.cultures
      Config.data('cosmere', 'cultures')
    end

    def decorator(simple: false, version: nil)
      CosmereDecorator.new.call(character: self, simple: simple, version: version)
    end

    def ancestry_name
      return '' unless data.ancestry

      default = ::Cosmere::Character.ancestries[data.ancestry]
      return translate(default['name']) if default

      custom_name = cosmere_names.fetch_item(key: :ancestries, id: data.ancestry)
      custom_name ? translate(custom_name[:name]) : '-'
    end

    def culture_names
      data.cultures.map do |culture|
        default = ::Cosmere::Character.cultures[culture]
        next translate(default['name']) if default

        custom_name = cosmere_names.fetch_item(key: :cultures, id: culture)
        custom_name ? translate(custom_name[:name]) : '-'
      end
    end

    def setting_name
      item = cosmere_names.fetch_item(key: :settings, id: data.setting)
      return '' unless item

      translate(item[:name])
    end

    private

    def cosmere_names = Charkeeper::Container.resolve('cache.cosmere_names')
  end
end
