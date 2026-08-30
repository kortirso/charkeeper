# frozen_string_literal: true

module SheetsContext
  module Pdf
    module Dc20
      class Template < SheetsContext::Pdf::Template
        include Deps[markdown: 'markdown']

        # rubocop: disable-next Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity, Metrics/CyclomaticComplexity, Layout/LineLength
        def to_pdf(character:, phtml: nil)
          super

          names = ::Dc20::Character.abilities
          font_size 6
          fill_color 'FFFFFF'
          text_box 'Prime', at: [302, 727], width: 43, align: :center
          names.keys.each_with_index do |item, index|
            trait_name = translate(names[item]['name'])
            text_box trait_name, at: [357 + (55 * index), 727], width: 43, align: :center
          end

          text_box I18n.t('services.sheets_context.dc20.pd'), at: [306, 620], width: 45, align: :center
          text_box I18n.t('services.sheets_context.dc20.ad'), at: [361, 620], width: 45, align: :center

          text_box I18n.t('services.sheets_context.dc20.speed'), at: [311, 475], width: 36, align: :center
          text_box I18n.t('services.sheets_context.dc20.save'), at: [353, 475], width: 36, align: :center
          text_box I18n.t('services.sheets_context.dc20.initiative'), at: [395, 475], width: 36, align: :center
          text_box I18n.t('services.sheets_context.dc20.attack'), at: [437, 475], width: 36, align: :center
          text_box I18n.t('services.sheets_context.dc20.spell'), at: [479, 475], width: 36, align: :center
          text_box I18n.t('services.sheets_context.dc20.martial'), at: [521, 475], width: 36, align: :center

          font_size 12
          fill_color '000000'
          text_box character.speeds['ground'].to_s, at: [314, 495], width: 30, align: :center
          text_box character.save_dc.to_s, at: [356, 495], width: 30, align: :center
          text_box "#{'+' if character.initiative.positive?}#{character.initiative}", at: [398, 495], width: 30, align: :center
          text_box "#{'+' if character.attack.positive?}#{character.attack}", at: [440, 495], width: 30, align: :center
          text_box "#{'+' if character.spell_check.positive?}#{character.spell_check}", at: [482, 495], width: 30, align: :center
          text_box "#{'+' if character.martial_check.positive?}#{character.martial_check}", at: [524, 495], width: 30, align: :center

          text_box character.precision_defense[:default].to_s, at: [308, 603], width: 39, align: :center
          text_box character.area_defense[:default].to_s, at: [363, 603], width: 39, align: :center

          font_size 8
          text_box "#{character.precision_defense[:heavy]}/#{character.precision_defense[:brutal]}", at: [308, 578], width: 39, align: :center
          text_box "#{character.area_defense[:heavy]}/#{character.area_defense[:brutal]}", at: [363, 578], width: 39, align: :center

          font_size 12
          fill_color '000000'
          value = "#{'+' if character.modified_abilities['prime'].positive?}#{character.modified_abilities['prime']}"
          text_box value, at: [304, 713], width: 39, align: :center
          names.keys.each_with_index do |item, index|
            value = "#{'+' if character.modified_abilities[item].positive?}#{character.modified_abilities[item]}"
            text_box value, at: [359 + (index * 55), 713], width: 39, align: :center
          end

          font_size 10
          fill_color '000000'
          names.keys.each_with_index do |item, index|
            value = "#{'+' if character.attribute_saves[item].positive?}#{character.attribute_saves[item]}"
            text_box value, at: [368 + (index * 55.25), 690], width: 20, align: :center
          end

          font_size 4
          fill_color '444444'
          text_box I18n.t('services.sheets_context.attack'), at: [455, 400], width: 30, height: 10, align: :center
          text_box I18n.t('services.sheets_context.damage'), at: [485, 400], width: 35, height: 10, align: :center
          text_box I18n.t('services.sheets_context.dist'), at: [520, 400], width: 30, height: 10, align: :center

          fill_color '000000'
          character.attacks.sort_by { |item| item[:ready_to_use] ? 0 : 1 }.first(10).each_with_index do |attack, index|
            font_size 8
            formatted_text_box [{ text: attack[:name], styles: attack[:ready_to_use] ? [:bold] : [], color: attack[:ready_to_use] ? '000000' : '444444' }], at: [327, 389 - (index * 36)], width: 100, height: 14

            font_size 6
            text_box "#{'+' if attack[:attack_bonus].positive?}#{attack[:attack_bonus]}", at: [455, 389 - (index * 36)], width: 30, height: 14, align: :center

            text_box attack[:damage].to_s, at: [485, 389 - (index * 36)], width: 35, height: 14, align: :center

            text_box attack[:tags].values.join(' / '), at: [327, 372 - (index * 36)], width: 220, height: 14
          end

          font_size 10
          fill_color '000000'
          character.skills.sort_by { |item| item[:name] }.each_with_index do |skill, index|
            text_box skill[:name], at: [52, 507 - (index * 20)], width: 140
            text_box "#{'+' if skill[:modifier].positive?}#{skill[:modifier]}", at: [200, 507 - (index * 20)], width: 38, align: :center
          end
          character.trades.sort_by { |item| item[:name] }.each_with_index do |skill, index|
            text_box skill[:name], at: [52, 208 - (index * 20)], width: 140
            text_box "#{'+' if skill[:modifier].positive?}#{skill[:modifier]}", at: [200, 208 - (index * 20)], width: 38, align: :center
          end

          font_size 16
          fill_color '000000'
          text_box character.health['current'].to_s, at: [30, 674], width: 70, align: :center
          text_box character.health['max'].to_s, at: [110, 674], width: 70, align: :center
          text_box character.health['temp'].to_s, at: [190, 674], width: 70, align: :center

          font_size 6
          text_box I18n.t('services.sheets_context.dnd.current_health').upcase, at: [30, 650], width: 70, align: :center
          text_box I18n.t('services.sheets_context.dnd.max_health').upcase, at: [110, 650], width: 70, align: :center
          text_box I18n.t('services.sheets_context.dnd.temp_health').upcase, at: [190, 650], width: 70, align: :center

          font_size 10
          text_box I18n.t('services.sheets_context.dc20.health'), at: [70, 709], width: 150, align: :center
          text_box I18n.t('services.sheets_context.dc20.skills'), at: [70, 534], width: 150, align: :center
          text_box I18n.t('services.sheets_context.dc20.trades'), at: [70, 235], width: 150, align: :center
          text_box I18n.t('services.sheets_context.dc20.defenses'), at: [346, 650], width: 175, align: :center
          text_box I18n.t('services.sheets_context.dc20.checks'), at: [346, 534], width: 175, align: :center
          text_box I18n.t('services.sheets_context.dc20.attacks'), at: [346, 428], width: 175, align: :center

          render_equipment_page(character)

          start_new_page

          render
        end

        private

        def heritage(character)
          character.data.ancestries.map do |ancestry|
            translate(::Dc20::Character.ancestry_info(ancestry)['name'])
          end.join(' / ')
        end

        def classes(character)
          translate(::Dc20::Character.class_info(character.main_class)['name'])
        end
      end
    end
  end
end
