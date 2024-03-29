function adjustConfig(params) {
  if (!params.config) {
    return;
  }

  if (params.card) {
    console.warn('Please move the "config" field to the "card.config"');

    params.card.config = params.config;
  }

  if (params.ideal) {
    console.warn('Please move the "config" field to the "ideal.config"');

    params.ideal.config = params.config;
  }

  delete params.config;
}

function adjustElementId(methodParams) {
  if (methodParams.cardNumber) {
    adjustElementId(methodParams.cardNumber);
  }

  if (methodParams.cardExpiry) {
    adjustElementId(methodParams.cardExpiry);
  }

  if (methodParams.cardCvc) {
    adjustElementId(methodParams.cardCvc);
  }

  if (!methodParams.elementId) {
    return;
  }

  if (methodParams.elementId.startsWith('#')) {
    console.warn(
      `Please remove the "#" sign from the "${methodParams.elementId}" element ID`,
    );

    methodParams.elementId = methodParams.elementId.substring(1);
  }
}

export function adjustParams(_params) {
  const params = { ..._params };

  adjustConfig(params);

  return params;
}

export function adjustMethodParams(_methodParams) {
  const methodParams = { ..._methodParams };

  adjustElementId(methodParams);

  return methodParams;
}
