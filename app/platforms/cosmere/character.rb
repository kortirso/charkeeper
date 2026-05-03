# frozen_string_literal: true

module Cosmere
  class CharacterData
    include StoreModel::Model

    attribute :level, :integer, default: 1
    attribute :ancestry, :string
    attribute :cultures, array: true, default: []
    attribute :path, :string
    attribute :abilities, array: true, default: { 'str' => 0, 'spd' => 0, 'int' => 0, 'wil' => 0, 'awa' => 0, 'pre' => 0 }
    attribute :health, :integer, default: 10
    attribute :health_max, :integer, default: 10
    attribute :focus, :integer, default: 2
    attribute :investiture, :integer, default: 2
    attribute :selected_skills, array: true, default: {} # { 'acrobatics' => 2, 'arcana' => 1, 'crafting' => 3, 'id' => 1 }
    attribute :additional_skills, array: true, default: {} # { 'id' => { 'name' => '', 'ability' => 'str' } }
    attribute :expertises, array: true, default: { 'weapon' => [], 'armor' => [], 'culture' => [] }
    attribute :custom_expertises, array: true, default: [] # [{ 'name' => '', 'desc' => '' }]
    attribute :purpose, :string
    attribute :obstacle, :string
    attribute :goals, array: true, default: [] # [{ id: 1, text: '', counter: 0 }]
    attribute :connections, array: true, default: [] # [{ id: 1, text: '' }]
    # для левелинга
    attribute :attribute_points, :integer
    attribute :skill_points, :integer
    attribute :guide_step, :integer # этап помощи при создании персонажа
  end

  class Character < Character
    attribute :data, Cosmere::CharacterData.to_type

    def decorator(simple: false, version: nil)
      CosmereDecorator.new.call(character: self, simple: simple, version: version)
    end
  end
end
