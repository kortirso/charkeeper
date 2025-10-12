# frozen_string_literal: true

module RollCheckHelper
  def daggerheart_roll_result_message(result)
    case result[:status]
    when :crit_success then I18n.t('services.bot_context.representers.check.daggerheart.crit_success')
    when :with_hope then I18n.t('services.bot_context.representers.check.daggerheart.with_hope', result: result[:total])
    when :with_fear then I18n.t('services.bot_context.representers.check.daggerheart.with_fear', result: result[:total])
    end
  end

  def dnd_roll_result_message(result)
    case result[:status]
    when :crit_success then I18n.t('services.bot_context.representers.check.dnd.crit_success')
    when :crit_failure then I18n.t('services.bot_context.representers.check.dnd.crit_failure')
    else I18n.t('services.bot_context.representers.check.dnd.success', result: result[:total])
    end
  end
end
