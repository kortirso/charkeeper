# frozen_string_literal: true

class Cthulhu7Decorator < ApplicationDecoratorV2
  def call(character:, simple: false, version: nil)
    @character = character
    @version = version
    @result = character.data.attributes

    generate_basis
    return self if simple

    calculate_secondary_abilities
    find_attacks

    self
  end

  private

  def generate_basis
    @result['name'] = @character.name
  end

  def calculate_secondary_abilities # rubocop: disable Metrics/AbcSize
    @result['skills'] = generate_skills_payload
    @result['health_max'] = (abilities['con'] + abilities['siz']) / 10
    @result['magic_max'] = abilities['pow'] / 5
    @result['sanity_max'] = abilities['pow']
    @result['damage_bonus'] = find_damage_bonus
    @result['build'] = find_build
    @result['speed'] = 8
  end

  def find_attacks
    @result['attacks'] = ([unarmed_weapon] + weapons).flat_map { |item| attack_values(item) }
  end

  def unarmed_weapon
    {
      items_slug: 'unarmed',
      items_name: { 'en' => 'Unarmed', 'ru' => 'Безоружная' },
      items_info: {
        'skill' => 'fighting',
        'damage' => '1d3',
        'with_damage_bonus' => true,
        'distance' => '-',
        'attacks' => 1
      }
    }
  end

  def attack_values(item)
    skill = skills.find { |skill| skill[:slug] == item.dig(:items_info, 'skill') }
    {
      slug: skill[:slug],
      name: translate(item[:items_name]),
      attack_bonus: skill[:level],
      damage: item.dig(:items_info, 'damage'),
      damage_bonus: item.dig(:items_info, 'with_damage_bonus') ? damage_bonus : nil,
      notes: item[:notes],
      ready_to_use: item[:states] ? item.dig(:states, 'hands').positive? : true,
      distance: item.dig(:items_info, 'distance'),
      attacks: item.dig(:items_info, 'attacks').to_i
    }.compact
  end

  def generate_skills_payload
    Config.data('cthulhu7', 'skills')
      .merge(additional_skills)
      .map { |slug, values| skill_payload(slug, values) }
  end

  def skill_payload(slug, values)
    {
      slug: slug,
      name: values['name'].is_a?(Hash) ? translate(values['name']) : values['name'],
      level: selected_skills[slug] || values['start'],
      start: values['start'],
      improved: improved_skills.include?(slug),
      hidden: hidden_skills.include?(slug)
    }
  end

  def find_damage_bonus
    value = abilities['str'] + abilities['siz']
    return -2 if value <= 64
    return -1 if value <= 84
    return 0 if value <= 124
    return '1d4' if value <= 164

    '1d6'
  end

  def find_build
    value = abilities['str'] + abilities['siz']
    return -2 if value <= 64
    return -1 if value <= 84
    return 0 if value <= 124
    return 1 if value <= 164

    2
  end

  def weapons
    @character
      .items
      .joins(:item)
      .where(items: { kind: 'weapon' })
      .hashable_pluck('items.slug', 'items.name', 'items.info', :notes, :states)
  end
end
