# frozen_string_literal: true

module SheetsContext
  module Pdf
    module Pathfinder2
      class Template < SheetsContext::Pdf::Template
        # rubocop: disable-next Metrics/AbcSize, Layout/LineLength, Metrics/MethodLength, Metrics/PerceivedComplexity, Metrics/CyclomaticComplexity
        def to_pdf(character:, phtml: nil)
          super

          abilities_names = ::Pathfinder2::Character.abilities
          font_size 6
          fill_color 'FFFFFF'
          %w[str dex con int wis cha].each_with_index do |item, index|
            ability_name = translate(abilities_names[item]['name'])
            text_box ability_name, at: [233 + (55 * index), 737], width: 43, align: :center
          end

          saving_throws = ::Pathfinder2::Character.saving_throws
          font_size 5
          %w[fortitude reflex will].each_with_index do |item, index|
            saving_throw = translate(saving_throws[item]['name'])
            text_box saving_throw, at: [365 + (54 * index), 600], width: 36, align: :center
          end

          text_box I18n.t('services.sheets_context.pathfinder.armor_class'), at: [48, 700], width: 43, align: :center
          text_box I18n.t('services.sheets_context.pathfinder.perception'), at: [101, 700], width: 43, align: :center
          text_box I18n.t('services.sheets_context.pathfinder.speed'), at: [154, 700], width: 43, align: :center

          font_size 12
          fill_color '000000'
          %w[str dex con int wis cha].each_with_index do |item, index|
            value = "#{'+' if character.abilities[item].positive?}#{character.abilities[item]}"
            text_box value, at: [242 + (index * 55), 719], width: 25, align: :center
          end

          %w[fortitude reflex will].each_with_index do |item, index|
            value = "#{'+' if character.saving_throws_value[item].positive?}#{character.saving_throws_value[item]}"
            text_box value, at: [368 + (index * 54), 621], width: 30, align: :center
          end

          text_box character.armor_class.to_s, at: [51, 722], width: 37, align: :center
          text_box "+#{character.perception}", at: [104, 722], width: 37, align: :center
          text_box character.speed.to_s, at: [157, 722], width: 37, align: :center

          font_size 16
          text_box character.health['current'].to_s, at: [30, 624], width: 70, align: :center
          text_box character.health['max'].to_s, at: [110, 624], width: 70, align: :center
          text_box character.health['temp'].to_s, at: [190, 624], width: 70, align: :center

          font_size 10
          fill_color '000000'

          skills_names = ::Pathfinder2::Character.skills
          character.skills.map { |skill|
            skill[:name] = character.lores[skill[:slug]] || translate(skills_names[skill[:slug]]['name'])
            skill
          }.sort_by { |item| item[:name] }.each_with_index do |skill, index|
            text_box skill[:name], at: [52, 492 - (index * 20)], width: 140
            text_box "#{'+' if skill[:modifier].positive?}#{skill[:modifier]}", at: [200, 492 - (index * 20)], width: 38, align: :center
          end

          text_box I18n.t('services.sheets_context.dnd.health'), at: [70, 660], width: 150, align: :center
          text_box I18n.t('services.sheets_context.dnd.saving_throws'), at: [365, 660], width: 145, align: :center
          text_box I18n.t('services.sheets_context.dnd.skills'), at: [70, 519], width: 150, align: :center
          text_box I18n.t('services.sheets_context.dnd.attacks'), at: [350, 519], width: 175, align: :center

          font_size 6
          text_box I18n.t('services.sheets_context.dnd.current_health').upcase, at: [30, 600], width: 70, align: :center
          text_box I18n.t('services.sheets_context.dnd.max_health').upcase, at: [110, 600], width: 70, align: :center
          text_box I18n.t('services.sheets_context.dnd.temp_health').upcase, at: [190, 600], width: 70, align: :center

          font_size 4
          fill_color '444444'
          text_box I18n.t('services.sheets_context.attack'), at: [432, 499], width: 30, height: 10, align: :center
          text_box I18n.t('services.sheets_context.damage'), at: [488, 499], width: 35, height: 10, align: :center
          text_box I18n.t('services.sheets_context.dist'), at: [522, 499], width: 30, height: 10, align: :center

          fill_color '000000'
          character.attacks.sort_by { |item| item[:ready_to_use] ? 0 : 1 }.first(12).each_with_index do |attack, index|
            font_size 8
            formatted_text_box [{ text: attack[:name], styles: attack[:ready_to_use] ? [:bold] : [], color: attack[:ready_to_use] ? '000000' : '444444' }], at: [329, 489 - (index * 36)], width: 100, height: 14

            font_size 6
            text_box "#{'+' if attack[:attack_bonus].positive?}#{attack[:attack_bonus]}", at: [432, 489 - (index * 36)], width: 30, height: 14, align: :center

            damage = attack[:damage].include?('d') ? "#{attack[:damage]}#{'+' if attack[:damage_bonus].positive?}#{attack[:damage_bonus] unless attack[:damage_bonus].zero?}" : ((attack[:damage].to_i + attack[:damage_bonus]).positive? ? (attack[:damage].to_i + attack[:damage_bonus]).to_s : '-') # rubocop: disable Style/NestedTernaryOperator
            text_box damage.to_s, at: [487, 489 - (index * 36)], width: 35, height: 14, align: :center

            if attack[:distance]
              text_box attack[:distance].to_s, at: [522, 489 - (index * 36)], width: 30, height: 14, align: :center
            end

            text_box attack[:tags].values.join(' / '), at: [329, 473 - (index * 36)], width: 220, height: 14
          end

          render_equipment_page(character)

          render
        end

        private

        def heritage(character)
          "#{character.info['subrace']} / #{character.info['background']}"
        end

        def classes(character)
          class_name = character.info['class']
          subclass_name = character.info['subclass']
          return class_name unless subclass_name

          "#{class_name} (#{subclass_name})"
        end
      end
    end
  end
end
